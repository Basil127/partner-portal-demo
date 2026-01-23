---
name: implementServiceLogic
description: Implement domain service logic including specialized calculations, mock fallbacks, and strict quality compliance.
argument-hint: Specify the service goal, primary data points (e.g., room types, products), and any specific calculation rules (e.g., duration-based pricing).
---
Use the schema or guidlines given by user on what needs to be implemented, if a schema is given follow it exactly do not modify it.
Implementing the domain service logic for the specified functionality. Ensure the implementation adheres to the project's architectural and quality standards:

1. **Domain Logic Separation**: Implement all business logic within the service layer, keeping it decoupled from web handlers and DAOs.
2. **Specific Data Points**: Configure the service with the following data: {{argument}}.
3. **Dynamic Calculations**: Implement logic to handle [e.g., duration-based pricing, discounts, or tax calculations] based on the input parameters.
4. **Mock/Fallback Mechanism**: If the primary data source (e.g., database) returns no results, implement a fallback mechanism (using `SimpleNamespace` or a similar mock object) to return the specified default data.
5. **Schema Consistency**: Map all outputs to the existing Pydantic schemas defined in the project. Ensure every field in the response model is appropriately populated.
6. **Strict Quality Control**: 
    - Ensure the code passes `ruff check` and is formatted with `ruff format`.
    - Resolve all MyPy type errors, using `Any` or explicit casting only where necessary to bridge differences between real models and mock fallbacks.
7. **Test before handover**:
    - Test the following 3 cases for each api before handing over:
      - Valid request with expected data.
      - Valid request with no data/ incorrect id that should be rejected.
      - Invalid request to ensure proper error handling.
    - Test using curl