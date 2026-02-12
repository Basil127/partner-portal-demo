import json
import builtins
from operaclone2.web.application import get_app

def generate_openapi_spec():
    app = get_app()
    openapi_data = app.openapi()
    
    # Ensure version string is present if missing
    if "version" not in openapi_data["info"]:
        openapi_data["info"]["version"] = "0.1.0"
        
    output_path = "../../openapi/external/mock-opera.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(openapi_data, f, indent=2)
    print(f"Generated {output_path}")

if __name__ == "__main__":
    generate_openapi_spec()
