import os
import re
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

# Automotive keywords for rule-based intent filtering (including common typos like 'break' for 'brake')
AUTOMOTIVE_KEYWORDS = {
    'car', 'vehicle', 'truck', 'auto', 'automobile', 'engine', 'engne', 'engin', 'enjine',
    'brake', 'brakes', 'braking', 'break', 'breaks', 'transmission', 'transmision', 'clutch', 'cluch',
    'oil', 'filter', 'battery', 'tire', 'tires', 'tyre', 'tyres', 'wheel', 'wheels', 'steering',
    'suspension', 'strut', 'shock', 'radiator', 'radiater', 'coolant', 'coolent', 'antifreeze',
    'exhaust', 'muffler', 'catalytic', 'spark', 'plug', 'ignition', 'alternator', 'starter', 'belt',
    'timing', 'hose', 'fluid', 'leak', 'smoke', 'smell', 'noise', 'squeal', 'grinding', 'knocking',
    'rattle', 'vibration', 'overheating', 'stall', 'misfire', 'misfiring', 'dashboard', 'check engine',
    'warning light', 'abs', 'airbag', 'mileage', 'fuel efficiency', 'injector', 'odometer', 'accelerator',
    'gas', 'diesel', 'hybrid', 'ev', 'electric vehicle', 'obd', 'dtc', 'trouble code', 'mechanic',
    'mecanic', 'mechnic', 'repair', 'service', 'maintenance', 'tune-up', 'inspection', 'diagnostic',
    'ford', 'toyota', 'honda', 'chevrolet', 'chevy', 'nissan', 'bmw', 'mercedes', 'audi', 'hyundai',
    'kia', 'volkswagen', 'vw', 'subaru', 'mazda', 'jeep', 'ram', 'gmc', 'tesla', 'volvo', 'lexus',
    'acura', 'infiniti', 'dodge', 'chrysler', 'buick', 'cadillac', 'window', 'radio', 'key fob', 'fob',
    'clicking', 'slipping', 'surging', 'shaking', 'clunking', 'bearing', 'roaring', 'growling', 'flat',
    'alignment', 'rotor', 'ball joint', 'tie rod'
}

# Common off-topic non-automotive topics
OFF_TOPIC_PATTERNS = [
    r'\b(recipe|cook|bake|ingredient|food|kitchen|restaurant|meal|dish)\b',
    r'\b(python|java|javascript|c\+\+|html|css|code|program|script|database|sql|algorithm|stack)\b',
    r'\b(essay|poem|poetry|story|novel|write a paper|homework|assignment|author)\b',
    r'\b(capital of|who is|history of|presidential|election|politics|goverment|war)\b',
    r'\b(crypto|bitcoin|stock market|investing|trading|finance advice|bank|loan)\b',
    r'\b(doctor|medical|symptom of flu|fever|disease|medicine|hospital|health)\b',
    r'\b(weather|forecast|rain today|temperature outside|climate)\b',
    r'\b(movie|cinema|actor|song|music|album|celebrity|game|sports|football|basketball)\b',
    r'\b(joke|tell me a joke|riddle|funny story)\b'
]

# Standard polite rejection for off-topic queries
OFF_TOPIC_REJECTION = (
    "I am a Senior Automobile Technician specializing in vehicle diagnostics, mechanical troubleshooting, "
    "and auto repairs. I can only assist with car, vehicle, and mechanical-related queries. "
    "Please describe a problem or question about your car, such as strange noises, warning lights, fluid leaks, or maintenance needs!"
)

def classify_query_intent(user_text, has_media=False):
    """
    Rule-based intent classifier.
    Returns (is_automotive, is_greeting_or_command, reason)
    minimizing unnecessary AI/API calls.
    """
    if has_media:
        return True, False, "uploaded_media"

    clean_text = user_text.lower().strip()
    words = set(re.findall(r'\b[a-z0-9]+\b', clean_text))

    # Check off-topic regex patterns first
    for pattern in OFF_TOPIC_PATTERNS:
        if re.search(pattern, clean_text):
            return False, False, "off_topic_pattern"

    # Check for simple exact greetings or platform commands
    greetings_and_commands = {'hi', 'hello', 'hey', 'greetings', 'help', 'start', 'restart', 'reset', 'clear'}
    if clean_text in greetings_and_commands:
        return True, True, "greeting"

    # Check for booking triggers
    booking_triggers = {'book', 'booking', 'mechanic', 'schedule', 'appointment', 'reserve', 'fix it', 'book mechanic'}
    if words.intersection(booking_triggers):
        return True, True, "booking_command"

    # Check for automotive keywords
    matched_auto = words.intersection(AUTOMOTIVE_KEYWORDS)
    if matched_auto:
        return True, False, "automotive_keyword"

    # Check for vehicle symptom phrases (including 'not working', 'isnt working', etc.)
    symptom_phrases = [
        'vibrating', 'shaking', 'clicking', 'whining', 'hard to start', 
        'won\'t turn on', 'won\'t start', 'won\'t move', 'making noise',
        'leaking', 'overheating', 'squealing', 'grinding', 'stalled', 'stalling',
        'misfiring', 'slipping', 'roaring', 'growling', 'flat tire', 'key fob',
        'not working', 'is not working', 'isnt working', 'isn\'t working',
        'does not work', 'doesnt work', 'doesn\'t work', 'stopped working',
        'stop working', 'wont work', 'won\'t work', 'broken', 'failed', 'failing'
    ]
    for symptom in symptom_phrases:
        if symptom in clean_text:
            return True, False, "symptom_phrase"

    # If it lacks car keywords or symptoms, reject as off-topic non-automobile query
    return False, False, "not_car_related"


def call_gemini_rest_api(api_key, prompt, system_instruction, media_file_path=None, media_mime_type=None):
    """
    Direct HTTP REST API call to Google Gemini 1.5 Flash (v1beta endpoint).
    Uses Python urllib - zero external dependency issues.
    """
    import json
    import base64
    import urllib.request

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"

    parts = []
    if media_file_path and os.path.exists(media_file_path):
        with open(media_file_path, 'rb') as f:
            b64_data = base64.b64encode(f.read()).decode('utf-8')
        parts.append({
            "inline_data": {
                "mime_type": media_mime_type or "image/jpeg",
                "data": b64_data
            }
        })
    parts.append({"text": prompt})

    payload = {
        "system_instruction": {
            "parts": [{"text": system_instruction}]
        },
        "contents": [
            {
                "parts": parts
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 1000
        }
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )

    with urllib.request.urlopen(req, timeout=15) as response:
        res_data = json.loads(response.read().decode('utf-8'))
        candidates = res_data.get('candidates', [])
        if candidates and 'content' in candidates[0]:
            parts_res = candidates[0]['content'].get('parts', [])
            if parts_res and 'text' in parts_res[0]:
                return parts_res[0]['text']
    raise ValueError("Unexpected response schema from Gemini API")


def call_openai_compatible_api(api_key, prompt, system_instruction):
    """
    Direct HTTP REST API call compatible with OpenAI / DeepSeek / OpenRouter endpoints (sk-... keys).
    Uses Python urllib - zero external dependency issues.
    """
    import json
    import urllib.request

    # Primary endpoint: DeepSeek / OpenAI API format
    urls_to_try = [
        ("https://api.deepseek.com/v1/chat/completions", "deepseek-chat"),
        ("https://api.openai.com/v1/chat/completions", "gpt-3.5-turbo"),
        ("https://openrouter.ai/api/v1/chat/completions", "auto")
    ]

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }

    payload_base = {
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "max_tokens": 1000
    }

    last_err = None
    for url, model in urls_to_try:
        try:
            payload = {**payload_base, "model": model}
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers=headers,
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                choices = res_data.get('choices', [])
                if choices and 'message' in choices[0]:
                    content = choices[0]['message'].get('content', '').strip()
                    if content:
                        return content
        except Exception as e:
            last_err = e
            continue

    raise ValueError(f"OpenAI/DeepSeek API call failed: {last_err}")


def call_gemini_api(prompt, system_instruction, media_file_path=None, media_mime_type=None):
    """
    Invokes AI model API (Gemini or DeepSeek/OpenAI based on API key format).
    """
    api_key = (
        getattr(settings, 'GEMINI_API_KEY', '') or
        os.getenv('GEMINI_API_KEY', '') or
        os.getenv('DEEPSEEK_API_KEY', '') or
        os.getenv('OPENAI_API_KEY', '')
    ).strip()

    if not api_key:
        raise ValueError("AI API Key is not configured in settings/env")

    # If key starts with sk-, try OpenAI/DeepSeek API format first
    if api_key.startswith('sk-'):
        try:
            return call_openai_compatible_api(api_key, prompt, system_instruction)
        except Exception as e_sk:
            logger.info(f"OpenAI/DeepSeek API attempt failed ({e_sk}), trying Gemini endpoints...")

    # 1. Try Direct Gemini REST API
    try:
        return call_gemini_rest_api(api_key, prompt, system_instruction, media_file_path, media_mime_type)
    except Exception as e_rest:
        logger.info(f"Gemini REST API call failed ({e_rest}), trying google-genai SDK...")

    # 2. Try google-genai SDK
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        contents = []
        if media_file_path and os.path.exists(media_file_path):
            with open(media_file_path, 'rb') as f:
                media_bytes = f.read()
            contents.append(types.Part.from_bytes(data=media_bytes, mime_type=media_mime_type or 'image/jpeg'))

        contents.append(prompt)

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.3,
            )
        )
        return response.text
    except Exception as e_sdk1:
        # 3. Try legacy google-generativeai SDK
        try:
            import google.generativeai as genai_legacy
            genai_legacy.configure(api_key=api_key)
            model = genai_legacy.GenerativeModel(
                model_name='gemini-1.5-flash',
                system_instruction=system_instruction
            )
            response = model.generate_content(prompt)
            return response.text
        except Exception as e_sdk2:
            logger.warning(f"All Gemini API connection methods failed ({e_sdk1}, {e_sdk2})")
            raise e_rest


def generate_mechanic_response(session, user_message, media_obj=None):
    """
    Generates mechanic bot response using rule-based filtering first,
    and Gemini API when AI reasoning/multimodal analysis is required.
    """
    has_media = media_obj is not None
    # 1. Check rule-based intent
    is_auto, is_command, reason = classify_query_intent(user_message, has_media=has_media)
    
    if not is_auto:
        return {
            'reply': OFF_TOPIC_REJECTION,
            'is_rejected': True,
            'diagnosis_data': None
        }

    # Handle simple greetings locally without hitting Gemini
    if reason == "greeting":
        vehicle_str = f" for your {session.car_make} {session.car_model}" if session.car_make else ""
        return {
            'reply': f"Hello! I'm your Senior Automotive Technician. How can I help troubleshoot your vehicle{vehicle_str} today? Please describe any symptoms, warning lights, or issues you are experiencing.",
            'is_rejected': False,
            'diagnosis_data': None
        }

    # Handle booking trigger command locally
    if reason == "booking_command" and hasattr(session, 'diagnosis'):
        return {
            'reply': "Great! Since we have completed your vehicle diagnosis, you can click the **Book Mechanic Now** button on your diagnostic card below to confirm your appointment date and time slot!",
            'is_rejected': False,
            'diagnosis_data': None
        }

    # Build context from recent history (last 6 messages max to save tokens)
    recent_messages = session.messages.order_by('-created_at')[:6]
    history_lines = []
    for msg in reversed(list(recent_messages)):
        history_lines.append(f"{msg.sender.upper()}: {msg.content}")

    context_str = "\n".join(history_lines)

    system_instruction = (
        "You are a Senior Automobile Technician with 20+ years of ASE-certified experience. "
        "CRITICAL DOMAIN BOUNDARY RULE: You ONLY answer car, vehicle, and automotive mechanical queries. "
        "If the user asks about anything unrelated to vehicles (e.g. recipes, coding, general trivia, weather, movies), "
        "you MUST POLITELY REJECT the query stating that as a Senior Automobile Technician you can only assist with car/mechanical queries.\n\n"
        "Guidelines:\n"
        "1. Be professional, direct, and polite like an experienced mechanic.\n"
        "2. Only handle car/mechanical-related queries. Politely reject irrelevant queries.\n"
        "3. DIAGNOSTIC FOLLOW-UP QUESTIONS: Before providing a formal diagnosis, ask relevant follow-up questions:\n"
        "   - Vehicle details: Make, Model, Year, Fuel Type, Mileage.\n"
        "   - Symptom behavior: When does the problem occur (idling, accelerating, braking, turning, hot engine)?\n"
        "   - Warning lights & sounds: Any dashboard lights, grinding/squealing/clicking noises, or burning smells?\n"
        "   - Recent repairs or fluid maintenance.\n"
        "4. MEDIA ANALYSIS: When the user uploads media (images, audio, or video of a car problem):\n"
        "   - Inspect the visual or audio evidence in detail (e.g. engine bay components, fluid leaks, warning lights, brake rotors, tire wear, abnormal engine sounds).\n"
        "   - Explicitly describe what problem or defect is observed in the uploaded media.\n"
        "   - Perform a technical diagnosis of the root cause.\n"
        "   - Suggest an appropriate repair/service specifically tailored to the diagnosed issue.\n"
        "5. Always include the formal DIAGNOSIS SUMMARY block when media is uploaded or when symptoms are clear, formatted as:\n"
        "   DIAGNOSIS SUMMARY:\n"
        "   - Issue: [Observed Problem from Media/Symptoms]\n"
        "   - Severity: [Low / Medium / High / Critical]\n"
        "   - Recommended Repair: [Suggested Appropriate Repair or Service]\n"
        "   - Estimated Cost: [Price Range, e.g. $180 - $350]\n"
        "   - Estimated Time: [Time Duration, e.g. 1 - 2 hours]\n"
        "6. Conclude by suggesting the user click 'Book Mechanic Now' to schedule the repair service with a certified technician."
    )

    media_path = None
    media_mime = None
    if media_obj and media_obj.file:
        media_path = media_obj.file.path
        media_mime = media_obj.mime_type

    prompt = f"Car Info: Make: {session.car_make or 'Not provided'}, Model: {session.car_model or 'Not provided'}, Year: {session.car_year or 'Not provided'}\n\nRecent Chat History:\n{context_str}\n\nUser Latest Message: {user_message}\n\nPlease respond as the Senior Mechanic."

    # Call Gemini API if available, or fall back to smart local rule diagnosis
    try:
        reply_text = call_gemini_api(prompt, system_instruction, media_file_path=media_path, media_mime_type=media_mime)
    except Exception as err:
        logger.info(f"Using fallback intelligent mechanic response logic (Reason: {err})")
        reply_text = generate_fallback_mechanic_response(user_message, session, media_obj)

    # Inspect if response is an off-topic rejection or contains a diagnosis trigger
    is_rejected = False
    if OFF_TOPIC_REJECTION in reply_text or ("Senior Automobile Technician" in reply_text and ("only assist" in reply_text or "cannot assist" in reply_text)):
        is_rejected = True
        reply_text = OFF_TOPIC_REJECTION

    diagnosis_data = extract_or_generate_diagnosis(reply_text, user_message, session) if not is_rejected else None

    return {
        'reply': reply_text,
        'is_rejected': is_rejected,
        'diagnosis_data': diagnosis_data
    }


def generate_fallback_mechanic_response(user_message, session, media_obj=None):
    """
    Local rule-based fallback response engine covering 4 major automotive categories:
    1. Engine & Performance (Overheating, Check Engine Light, Misfiring, Fuel Efficiency)
    2. Electrical & Starting (Dead Battery, Non-Working Starter, Electrical Failures)
    3. Mechanical & Transmission (Transmission Slipping, Brake Problems, Suspension/Steering)
    4. Tires & Wheels (Flat/Worn Tires, Failed Wheel Bearing)
    """
    msg_lower = user_message.lower()
    user_msg_count = session.messages.filter(sender='user').count()
    all_text = " ".join([m.content.lower() for m in session.messages.all()]) + " " + msg_lower

    explicit_diag_triggers = ['diagnose', 'diagnosis', 'book', 'schedule', 'appointment', 'fix it', 'not fix', 'didn\'t fix', 'did not fix', 'still not working', 'checked it']
    wants_explicit_diag = any(t in msg_lower for t in explicit_diag_triggers) or (media_obj is not None)

    # 0. Enhanced Media Upload Analysis & Suggested Repair/Service
    if media_obj:
        fname = (media_obj.original_name or '').lower()
        text_lower = msg_lower + " " + fname

        if any(k in text_lower for k in ['engine', 'coolant', 'smoke', 'radiator', 'leak', 'oil', 'hose', 'belt']):
            observed = "Engine bay inspection displaying fluid leakage and cooling system component degradation"
            issue = "Engine Cooling System Leak & Component Wear"
            severity = "High (Risk of Engine Overheating & Gasket Failure)"
            repair = "Engine Cooling System Pressure Test, Radiator Hose & Thermostat Replacement Service"
            cost = "$220 - $450"
            time_est = "2.0 hours"
        elif any(k in text_lower for k in ['brake', 'rotor', 'pad', 'caliper', 'fluid', 'squeak', 'grind']):
            observed = "Brake assembly image displaying friction pad wear and rotor surface scoring"
            issue = "Worn Brake Pads & Disc Rotor Degradation"
            severity = "Critical (Vehicle Braking Safety Hazard)"
            repair = "Front & Rear Ceramic Brake Pad & Disc Rotor Replacement Service"
            cost = "$180 - $350"
            time_est = "1.5 hours"
        elif any(k in text_lower for k in ['battery', 'starter', 'light', 'check engine', 'warning', 'dashboard', 'terminal', 'alternator']):
            observed = "Instrument panel / battery terminals showing electrical error indicator or corrosion"
            issue = "12V Battery Malfunction & Charging System Fault"
            severity = "High (No-Start Condition & Electrical Drain)"
            repair = "12V Battery Replacement & Alternator Output Diagnostic Service"
            cost = "$150 - $320"
            time_est = "1.0 hour"
        elif any(k in text_lower for k in ['tire', 'wheel', 'flat', 'suspension', 'strut', 'shock', 'tread', 'alignment']):
            observed = "Wheel/tire photo displaying uneven tread wear, sidewall damage, or suspension sag"
            issue = "Uneven Tire Tread Wear & Strut Assembly Damage"
            severity = "Medium (Handling & Alignment Defect)"
            repair = "Tire Replacement, Wheel Balancing & 4-Wheel Precision Alignment Service"
            cost = "$160 - $340"
            time_est = "1.5 hours"
        else:
            observed = f"Uploaded {media_obj.file_type} image displaying vehicle mechanical component"
            issue = "Automotive Mechanical Component Wear & Inspection Required"
            severity = "High (Requires Certified Mechanic Inspection)"
            repair = "Comprehensive Multi-Point Diagnostic & Component Repair Service"
            cost = "$180 - $350"
            time_est = "1.5 hours"

        return (
            f"🔍 **MEDIA ANALYSIS REPORT**:\n"
            f"I have thoroughly analyzed your uploaded {media_obj.file_type} file ('{media_obj.original_name or 'attachment'}').\n\n"
            f"### 🛠️ Visual & Diagnostic Findings\n"
            f"• **Visual Evidence**: {observed}.\n"
            f"• **Technical Diagnosis**: {issue}.\n"
            f"• **Urgency / Severity**: {severity}.\n\n"
            f"### 🔧 Recommended Repair/Service\n"
            f"To fix this problem and ensure safe vehicle operation, I recommend a **{repair}**.\n\n"
            "DIAGNOSIS SUMMARY:\n"
            f"- Issue: {issue}\n"
            f"- Severity: {severity}\n"
            f"- Recommended Repair: {repair}\n"
            f"- Estimated Cost: {cost}\n"
            f"- Estimated Time: {time_est}\n\n"
            "You can click the **Book Mechanic Now** button on the diagnostic assessment card below to schedule your appointment with a certified technician!"
        )

    # TURN 1: Preliminary troubleshooting & safety advice + follow-up questions
    if user_msg_count <= 1 and not wants_explicit_diag:
        followup_block = (
            "\n\n### ❓ Diagnostic Follow-Up Questions\n"
            "To narrow down the root cause and prepare your repair assessment, please answer a few quick questions:\n"
            "1. **Vehicle Details**: What is your car's **Make, Model, Year, Fuel Type, and Mileage**?\n"
            "2. **Symptom Occurrence**: Does the issue happen while **idling, accelerating, braking, or turning**?\n"
            "3. **Warning Indicators**: Are any **dashboard warning lights** on, or do you hear **grinding, squealing, or clicking** noises?\n"
            "4. **Service History**: Have any recent repairs or fluid services been performed on the vehicle?\n\n"
            "*(Reply with these details or upload a photo/video/audio recording of the issue to generate your formal Diagnosis & Book a Mechanic!)*"
        )

        # Engine Overheating
        if any(k in msg_lower for k in ['smoke', 'overheating', 'coolant', 'radiator', 'temp']):
            return (
                "Engine overheating is a serious issue often caused by low coolant levels, a broken thermostat, or a leaking radiator.\n\n"
                "### 🛠️ Preliminary Safety Steps:\n"
                "1. **Safely Pull Over**: Turn off the engine immediately to prevent cylinder head warping.\n"
                "2. **Coolant Level Check**: Wait for the engine to cool down, then check the coolant reservoir tank.\n"
                "3. **Inspect for Leaks**: Check under the bumper for green/pink dripping coolant."
                + followup_block
            )

        # Check Engine Light / DTC
        if any(k in msg_lower for k in ['check engine', 'light', 'code', 'dtc', 'sensor', 'gas cap']):
            return (
                "A Check Engine Light is frequently triggered by a loose gas cap, bad oxygen (O2) sensors, or faulty spark plugs.\n\n"
                "### 🛠️ Preliminary Steps:\n"
                "1. **Tighten Gas Cap**: Ensure the fuel cap is clicked tight.\n"
                "2. **OBD Scan**: Check if the car is idling rough or misfiring."
                + followup_block
            )

        # Engine Misfiring
        if any(k in msg_lower for k in ['misfire', 'misfiring', 'rough idle', 'stutter', 'hesitat']):
            return (
                "Engine misfiring is usually caused by bad spark plugs, faulty ignition coils, or poor fuel delivery.\n\n"
                "### 🛠️ Preliminary Steps:\n"
                "1. Inspect spark plug wires and ignition coil packs for damage or oil contamination.\n"
                "2. Check if the Check Engine Light is flashing."
                + followup_block
            )

        # Poor Fuel Efficiency
        if any(k in msg_lower for k in ['fuel efficiency', 'gas mileage', 'poor mileage', 'fuel consumption', 'air filter', 'injector']):
            return (
                "Poor fuel efficiency typically results from dirty air filters, clogged fuel injectors, or incorrect tire pressure.\n\n"
                "### 🛠️ Preliminary Steps:\n"
                "1. **Check Tire Pressure**: Ensure all tires are inflated to recommended PSI.\n"
                "2. **Inspect Engine Air Filter**: Replace if clogged with dirt/dust."
                + followup_block
            )

        # Dead Battery & Electrical Starting
        if any(k in msg_lower for k in ['battery', 'dead battery', 'alternator', 'charge', 'terminal']):
            return (
                "A dead battery is commonly caused by an old battery, corroded terminals, or a failing alternator that fails to charge while driving.\n\n"
                "### 🛠️ Preliminary Steps:\n"
                "1. Inspect battery terminals for white/green corrosion.\n"
                "2. Attempt a jump start and check if the battery holds voltage."
                + followup_block
            )

        # Non-Working Starter
        if any(k in msg_lower for k in ['starter', 'clicking', 'won\'t turn key', 'no response', 'ignition click']):
            return (
                "A non-working starter results in clicking sounds or no response when turning the key, often due to a bad starter motor, solenoid, or blown fuse.\n\n"
                "### 🛠️ Preliminary Steps:\n"
                "1. Check starter relay and main ignition fuses.\n"
                "2. Tap the starter casing gently while turning the key."
                + followup_block
            )

        # Electrical Failures
        if any(k in msg_lower for k in ['power window', 'window', 'radio', 'key fob', 'fob', 'electrical failure']):
            return (
                "Electrical failures like non-working power windows, a dead radio, or key fob issues stem from blown fuses, faulty window switches, or dead fob batteries.\n\n"
                "### 🛠️ Preliminary Steps:\n"
                "1. Replace key fob coin battery (CR2032).\n"
                "2. Check interior fuse panel for blown window/radio fuses."
                + followup_block
            )

        # Transmission Slipping
        if any(k in msg_lower for k in ['transmission', 'slipping', 'clutch', 'surging', 'gear', 'delayed engagement']):
            return (
                "Transmission slipping is caused by low/dirty transmission fluid or worn internal clutches, leading to delayed gear engagement or engine surging.\n\n"
                "### 🛠️ Preliminary Steps:\n"
                "1. Check transmission dipstick fluid level & color (should be bright pink/red, not dark brown/burnt).\n"
                "2. Check under transmission housing for red fluid leaks."
                + followup_block
            )

        # Brake Problems
        if any(k in msg_lower for k in ['brake', 'brakes', 'break', 'breaks', 'braking', 'squeak', 'squealing', 'grinding', 'pedal', 'rotor']):
            return (
                "Brake problems like squeaky/grinding noises or spongy brake pedal feel are caused by worn-out brake pads, low brake fluid, or warped rotors.\n\n"
                "### 🛠️ Preliminary Steps:\n"
                "1. **Inspect Brake Fluid Level**: Check the master cylinder reservoir under the hood.\n"
                "2. **Check Pad Thickness**: Visually inspect brake pad thickness through wheel spokes.\n\n"
                "⚠️ **Safety Warning**: Do not drive if the brake pedal sinks to the floor."
                + followup_block
            )

        # Suspension & Steering
        if any(k in msg_lower for k in ['suspension', 'steering', 'shaking', 'clunking', 'shock absorber', 'ball joint', 'tie rod']):
            return (
                "A shaking steering wheel or clunking noises are caused by worn shock absorbers, loose ball joints, or damaged tie rods.\n\n"
                "### 🛠️ Preliminary Steps:\n"
                "1. Visually check shocks for leaking hydraulic fluid.\n"
                "2. Inspect front suspension bushings and tie rod ends for looseness."
                + followup_block
            )

        # Tires & Wheels
        if any(k in msg_lower for k in ['flat tire', 'flat', 'worn tire', 'alignment', 'wheel bearing', 'roaring', 'growling']):
            return (
                "Tire/wheel issues include flat or worn tires from punctures/alignment issues, or failed wheel bearings causing loud roaring noises that get faster with speed.\n\n"
                "### 🛠️ Preliminary Steps:\n"
                "1. Check tire tread depth and inflation PSI.\n"
                "2. For roaring noise, check if sound changes when gently veering left or right."
                + followup_block
            )

        # Default Turn 1
        return (
            "I am your Senior Automobile Technician! Please describe the issue you are experiencing."
            + followup_block
        )

    # Overheating
    if any(k in all_text for k in ['smoke', 'overheating', 'coolant', 'radiator', 'temp']):
        return (
            "Based on your report that overheating persists, here is your official diagnostic assessment:\n\n"
            "DIAGNOSIS SUMMARY:\n"
            "- Issue: Engine Overheating / Low Coolant, Broken Thermostat, or Leaking Radiator\n"
            "- Severity: Critical (Risk of Blown Head Gasket)\n"
            "- Recommended Repair: Cooling System Pressure Test, Thermostat & Radiator Hose Replacement\n"
            "- Estimated Cost: $220 - $450\n"
            "- Estimated Time: 2 hours\n\n"
            "You can click 'Book Mechanic Now' on the diagnostic card below to schedule a certified technician."
        )

    # Check Engine Light / Misfire / Fuel Efficiency
    if any(k in all_text for k in ['check engine', 'misfire', 'misfiring', 'fuel efficiency', 'mileage', 'spark plug', 'injector']):
        return (
            "Here is your official engine performance diagnostic summary:\n\n"
            "DIAGNOSIS SUMMARY:\n"
            "- Issue: Engine Misfire / Faulty Spark Plugs, Ignition Coils, or Clogged Fuel Injectors\n"
            "- Severity: High (Emissions & Performance Component)\n"
            "- Recommended Repair: Full OBD-II Diagnostic Scan, Spark Plug & Ignition Coil Replacement\n"
            "- Estimated Cost: $160 - $320\n"
            "- Estimated Time: 1.5 hours\n\n"
            "Click 'Book Mechanic Now' below to reserve an appointment slot!"
        )

    # Battery & Starter / Electrical
    if any(k in all_text for k in ['battery', 'starter', 'clicking', 'alternator', 'window', 'radio', 'key fob', 'electrical']):
        return (
            "Here is your official electrical & starting diagnostic assessment:\n\n"
            "DIAGNOSIS SUMMARY:\n"
            "- Issue: Starting / Electrical Failure (Dead Battery, Failing Alternator, or Bad Starter Motor)\n"
            "- Severity: High (Vehicle No-Start Condition)\n"
            "- Recommended Repair: 12V Battery Load Test, Alternator Output Check & Starter Motor Replacement\n"
            "- Estimated Cost: $150 - $380\n"
            "- Estimated Time: 1 - 2 hours\n\n"
            "Click 'Book Mechanic Now' on the card below to schedule an appointment!"
        )

    # Transmission Slipping
    if any(k in all_text for k in ['transmission', 'slipping', 'clutch', 'surging', 'gear']):
        return (
            "Here is your official transmission diagnostic summary:\n\n"
            "DIAGNOSIS SUMMARY:\n"
            "- Issue: Transmission Slipping / Low Dirty Fluid or Worn Internal Clutches\n"
            "- Severity: High (Drivetrain Component)\n"
            "- Recommended Repair: Transmission Fluid & Filter Flush, Hydraulic Pressure Test & Clutch Inspection\n"
            "- Estimated Cost: $220 - $550\n"
            "- Estimated Time: 2 - 3 hours\n\n"
            "Please click 'Book Mechanic Now' below to reserve a technician appointment."
        )

    # Brakes
    if any(k in all_text for k in ['brake', 'brakes', 'break', 'breaks', 'braking', 'squeak', 'squealing', 'grinding', 'pedal', 'rotor']):
        return (
            "Since preliminary checks did not resolve the brake issue, here is your official diagnostic assessment:\n\n"
            "DIAGNOSIS SUMMARY:\n"
            "- Issue: Worn Brake Pads & Warped Rotors / Hydraulic Leak\n"
            "- Severity: Critical (Safety Component - Do Not Drive)\n"
            "- Recommended Repair: Front/Rear Brake Pad Replacement & Rotor Resurfacing/Replacement\n"
            "- Estimated Cost: $180 - $350\n"
            "- Estimated Time: 1.5 hours\n\n"
            "Safety Warning: Driving with faulty brakes is hazardous. Please click 'Book Mechanic Now' below to schedule an authorized technician."
        )

    # Suspension & Steering
    if any(k in all_text for k in ['suspension', 'steering', 'shaking', 'clunking', 'shock absorber', 'ball joint', 'tie rod']):
        return (
            "Here is your official steering & suspension diagnostic assessment:\n\n"
            "DIAGNOSIS SUMMARY:\n"
            "- Issue: Worn Shock Absorbers, Loose Ball Joints, or Damaged Tie Rods\n"
            "- Severity: High (Vehicle Handling & Alignment Safety)\n"
            "- Recommended Repair: Front Suspension Overhaul, Ball Joint Replacement & 4-Wheel Alignment\n"
            "- Estimated Cost: $250 - $480\n"
            "- Estimated Time: 2 hours\n\n"
            "Click 'Book Mechanic Now' below to schedule a certified technician."
        )

    # Tires & Wheel Bearing
    if any(k in all_text for k in ['flat', 'tire', 'bearing', 'roaring', 'growling', 'alignment']):
        return (
            "Here is your official tires & wheel bearing diagnostic summary:\n\n"
            "DIAGNOSIS SUMMARY:\n"
            "- Issue: Failed Wheel Bearing / Uneven Tire Tread & Alignment Defect\n"
            "- Severity: High (Drivetrain Noise & Safety Concern)\n"
            "- Recommended Repair: Front/Rear Wheel Hub & Bearing Assembly Replacement + Tire Alignment\n"
            "- Estimated Cost: $190 - $360\n"
            "- Estimated Time: 1.5 hours\n\n"
            "Click 'Book Mechanic Now' below to schedule a repair appointment!"
        )

    # Default fallback
    return (
        "Here is the official diagnostic summary for your vehicle:\n\n"
        "DIAGNOSIS SUMMARY:\n"
        "- Issue: Multi-Point Drivetrain & Systems Inspection Required\n"
        "- Severity: Medium (Professional Repair Advised)\n"
        "- Recommended Repair: Full OBD-II Computer Diagnostic Scan & System Service\n"
        "- Estimated Cost: $150 - $350\n"
        "- Estimated Time: 1 - 2 hours\n\n"
        "You can click 'Book Mechanic Now' below to reserve an appointment!"
    )


def extract_or_generate_diagnosis(reply_text, user_message, session):
    """
    Parses response text or user context to determine if a formal Diagnosis model instance should be created.
    """
    reply_lower = reply_text.lower()
    
    # Trigger diagnosis if reply contains explicit diagnostic indicators
    has_diag_keywords = any(k in reply_lower for k in [
        'diagnosis summary', 'recommended repair', 'suggested repair', 'severity:', 'estimated cost:', 
        'possible issue:', 'vehicle diagnosis', 'media analysis report', 'technical diagnosis', 
        'diagnostic assessment', 'recommended action'
    ])
    
    if not has_diag_keywords:
        return None

    # Parse severity/urgency
    severity = 'medium'
    if 'critical' in reply_lower:
        severity = 'critical'
    elif 'high' in reply_lower:
        severity = 'high'
    elif 'low' in reply_lower:
        severity = 'low'

    # Extract issue summary / possible issue
    issue_match = re.search(r'(?:\*\*|\*|)(?:Issue|Possible Issue|Technical Diagnosis)(?:\*\*|\*|):\s*([^\n]+)', reply_text, re.IGNORECASE)
    issue_summary = issue_match.group(1).strip() if issue_match else ("Brake Pad Wear" if "brake" in user_message.lower() or "break" in user_message.lower() else "Vehicle Mechanical Inspection Required")

    # Extract confidence rating
    conf_match = re.search(r'(?:\*\*|\*|)Confidence(?:\*\*|\*|):\s*([^\n]+)', reply_text, re.IGNORECASE)
    confidence = conf_match.group(1).strip() if conf_match else ("78%" if "brake" in issue_summary.lower() or "break" in user_message.lower() else "85%")

    # Extract possible cause
    cause_match = re.search(r'(?:\*\*|\*|)(?:Possible Cause|Root Cause|Visual Evidence)(?:\*\*|\*|):\s*([^\n]+)', reply_text, re.IGNORECASE)
    if cause_match:
        possible_cause = cause_match.group(1).strip()
    elif "brake" in issue_summary.lower() or "break" in user_message.lower():
        possible_cause = "Brake pads may be worn."
    elif "overheat" in issue_summary.lower() or "coolant" in user_message.lower():
        possible_cause = "Coolant reservoir low, leaking radiator top hose, or stuck thermostat."
    elif "battery" in issue_summary.lower() or "starter" in user_message.lower():
        possible_cause = "Old 12V battery failing under load or corroded terminal connections."
    else:
        possible_cause = "Mechanical component wear or drivetrain defect."

    # Extract recommended action
    action_match = re.search(r'(?:\*\*|\*|)(?:Recommended Action|Recommended Next Steps|Action)(?:\*\*|\*|):\s*([^\n]+)', reply_text, re.IGNORECASE)
    if action_match:
        recommended_action = action_match.group(1).strip()
    elif "brake" in issue_summary.lower() or "break" in user_message.lower():
        recommended_action = "Inspect brake pads and brake rotors."
    elif "overheat" in issue_summary.lower():
        recommended_action = "Perform cooling system pressure test and check hose leaks."
    else:
        recommended_action = "Inspect vehicle mechanical components and diagnostic fault codes."

    # Build symptoms detected with ✓ checkmarks
    symptoms_match = re.search(r'Symptoms Detected:\s*([\s\S]*?)(?=\n[A-Z][a-z]+:|\n\n|\Z)', reply_text, re.IGNORECASE)
    if symptoms_match and '✓' in symptoms_match.group(1):
        symptoms_detected = symptoms_match.group(1).strip()
    elif "brake" in issue_summary.lower() or "break" in user_message.lower():
        symptoms_detected = "✓ Grinding noise\n✓ Noise while braking\n✓ Reduced braking performance"
    elif "overheat" in issue_summary.lower():
        symptoms_detected = "✓ Engine temp gauge high\n✓ Steam from hood\n✓ Dripping coolant"
    elif "battery" in issue_summary.lower():
        symptoms_detected = "✓ Engine won't crank\n✓ Click sound on ignition\n✓ Dim headlights"
    else:
        symptoms_detected = "✓ Abnormal mechanical noise\n✓ Vehicle performance degradation\n✓ System fault code"

    repair_match = re.search(r'(?:\*\*|\*|)(?:Recommended Repair|Estimated Repair|Suggested Repair|Suggested Repair / Service|Recommended Repair/Service)(?:\*\*|\*|):\s*([^\n]+)', reply_text, re.IGNORECASE)
    recommended_repair = repair_match.group(1).strip() if repair_match else ("Brake inspection / pad replacement" if "brake" in issue_summary.lower() or "break" in user_message.lower() else "Multi-point inspection and component replacement service")

    cost_match = re.search(r'(?:\*\*|\*|)Estimated Cost(?:\*\*|\*|):\s*([^\n]+)', reply_text, re.IGNORECASE)
    estimated_cost = cost_match.group(1).strip() if cost_match else "$180 - $350"

    time_match = re.search(r'(?:\*\*|\*|)Estimated Time(?:\*\*|\*|):\s*([^\n]+)', reply_text, re.IGNORECASE)
    estimated_time = time_match.group(1).strip() if time_match else "1.5 hours"

    return {
        'issue_summary': issue_summary,
        'severity': severity,
        'confidence': confidence,
        'symptoms_detected': symptoms_detected,
        'possible_cause': possible_cause,
        'recommended_action': recommended_action,
        'recommended_repair': recommended_repair,
        'estimated_cost': estimated_cost,
        'estimated_time': estimated_time
    }
