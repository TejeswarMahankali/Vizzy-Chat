#import google.generativeai as genai
#import os
#from dotenv import load_dotenv

#load_dotenv()

#genai.configure(
 #   api_key=os.getenv("GEMINI_API_KEY")
#)

#model = genai.GenerativeModel("gemini-2.0-flash")

#def ask_gemini(prompt):
#    response = model.generate_content(prompt)
 #   return response.text
def ask_gemini(prompt):
    return f"""
Story generated for: {prompt}

Once upon a time, there was a brave rabbit named Coco.

Coco lived in a forest where everyone was afraid of the dark cave on the hill.

One day, Coco entered the cave and discovered a trapped family of birds.

With courage and determination, Coco rescued them and became the hero of the forest.

The End.
"""