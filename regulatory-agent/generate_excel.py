import pandas as pd
import os

os.makedirs('d:/Projects/sih26_kavach/regulatory-agent/data', exist_ok=True)

data = [
    {"sector": "Manufacturing", "location": "Maharashtra", "project_size_range": "Large", "required_approval": "Environmental Clearance", "issuing_authority": "MoEFCC", "required_documents": "EIA Report, Site Plan"},
    {"sector": "Manufacturing", "location": "Maharashtra", "project_size_range": "Medium", "required_approval": "Consent to Establish", "issuing_authority": "State Pollution Control Board", "required_documents": "Detailed Project Report, Land Ownership Document"},
    {"sector": "IT", "location": "Karnataka", "project_size_range": "Any", "required_approval": "Shops and Establishment License", "issuing_authority": "Labor Department", "required_documents": "Form A, Incorporation Certificate"},
    {"sector": "Pharmaceuticals", "location": "Gujarat", "project_size_range": "Large", "required_approval": "Drug Manufacturing License", "issuing_authority": "CDSCO", "required_documents": "Form 27, Plant Master File"},
    {"sector": "Textiles", "location": "Tamil Nadu", "project_size_range": "Small", "required_approval": "Fire NOC", "issuing_authority": "State Fire Services", "required_documents": "Building Plan, Fire Safety Setup Details"},
    {"sector": "Food Processing", "location": "Punjab", "project_size_range": "Medium", "required_approval": "FSSAI Central License", "issuing_authority": "FSSAI", "required_documents": "Form B, Water Testing Report"},
    {"sector": "Mining", "location": "Odisha", "project_size_range": "Large", "required_approval": "Mining Lease", "issuing_authority": "Ministry of Mines", "required_documents": "Mining Plan, EC Copy"},
    {"sector": "Renewable Energy", "location": "Rajasthan", "project_size_range": "Large", "required_approval": "Land Allotment", "issuing_authority": "State Nodal Agency", "required_documents": "DPR, Net Worth Certificate"},
    {"sector": "Chemicals", "location": "Maharashtra", "project_size_range": "Large", "required_approval": "Factory License", "issuing_authority": "Directorate of Industrial Safety", "required_documents": "Form 1, Building Stability Certificate"},
    {"sector": "Electronics", "location": "Uttar Pradesh", "project_size_range": "Medium", "required_approval": "E-Waste Registration", "issuing_authority": "CPCB", "required_documents": "Form 1(a), Process Flow Diagram"},
    {"sector": "Automobile", "location": "Haryana", "project_size_range": "Large", "required_approval": "Consent to Operate", "issuing_authority": "State Pollution Control Board", "required_documents": "ETP Setup Details, Previous CTO"},
    {"sector": "Construction", "location": "Delhi", "project_size_range": "Large", "required_approval": "Building Plan Approval", "issuing_authority": "Municipal Corporation", "required_documents": "Architect Drawings, Structural Safety Certificate"},
    {"sector": "Logistics", "location": "West Bengal", "project_size_range": "Any", "required_approval": "Trade License", "issuing_authority": "Local Municipal Body", "required_documents": "Rent Agreement, ID Proof"},
    {"sector": "Healthcare", "location": "Kerala", "project_size_range": "Medium", "required_approval": "Clinical Establishment Registration", "issuing_authority": "State Health Department", "required_documents": "Doctor Qualifications, Bio-medical Waste Agreement"},
    {"sector": "Hospitality", "location": "Goa", "project_size_range": "Any", "required_approval": "Tourism Department Registration", "issuing_authority": "State Tourism Board", "required_documents": "NOC from Panchayat, Health Trade License"}
]

df = pd.DataFrame(data)
df.to_excel('d:/Projects/sih26_kavach/regulatory-agent/data/regulatory_matrix.xlsx', index=False)
print("Scaffolded regulatory_matrix.xlsx")
