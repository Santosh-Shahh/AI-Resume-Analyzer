from flask import Flask, request, jsonify
from PyPDF2 import PdfReader
import os
from flask_cors import CORS # Added CORS to allow requests from backend if needed, though mostly backend proxies

app = Flask(__name__)
# CORS(app) # Enable if frontend calls directly, but here backend calls it.

@app.route('/analyze', methods=['POST'])
def analyze_resume():
    data = request.json
    file_path = data.get('filePath')
    job_description = data.get('jobDescription')

    print(f"Analyzing file: {file_path}")

    if not file_path or not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 400

    try:
        # Extract text from PDF
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        
        print("Text extracted successfully.")

        # Placeholder for AI analysis logic
        # In a real scenario, you would send 'text' and 'job_description' to OpenAI/Gemini
        
        # Mock Response
        analysis_result = {
            "score": 85,
            "keywordsMatched": ["Python", "Flask", "React", "Node.js"],
            "keywordsMissing": ["Docker", "Kubernetes", "AWS"],
            "suggestions": [
                "Consider adding a project section highlighting containerization.",
                "Mention more leadership experience.",
                "Add a summary of your key achievements at the top."
            ]
        }

        return jsonify(analysis_result)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=8001, debug=True)
