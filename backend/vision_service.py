import os
import base64
import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")


def analyze_image(image_path, prompt):

    # Read image
    with open(image_path, "rb") as image_file:
        image_bytes = image_file.read()

    # Convert image to Base64
    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
    "model": "openai/gpt-4o",
    "max_tokens": 1000,
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": prompt
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        }
    ]
}

    response = requests.post(
    "https://openrouter.ai/api/v1/chat/completions",
    headers=headers,
    json=payload
    )

    print("Status Code:", response.status_code)
    print(response.text)

    if response.status_code != 200:
        return f"Error: {response.text}"

    result = response.json()

    print("\n==============================")
    print("FINAL ANSWER:")
    print(result["choices"][0]["message"]["content"])
    print("==============================\n")

    return result["choices"][0]["message"]["content"]