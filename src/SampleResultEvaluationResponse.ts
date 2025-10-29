export const evaluationData = {
    "scores": [
        {
            "id": "f864dedb-3a1a-424f-9b54-65be67f13b23",
            "candidate_id": "1406c7f6-7c5f-4612-9da7-9b0d1bd471a2",
            "persona_id": "b52876f0-4e4c-484b-8937-35653c626c21",
            "cv_id": "6f8a4c28-62e4-4b74-b7a7-1eeaec5df6bf",
            "pipeline_stage_reached": 3,
            "final_score": 68.78,
            "final_decision": "MODERATE_FIT",
            "embedding_score": 62.45,
            "lightweight_llm_score": 78,
            "detailed_llm_score": 68.78,
            "scored_at": "2025-10-28T04:39:04",
            "scoring_version": "v1.0",
            "processing_time_ms": 34983,
            "candidate_name": "B BHARATHI",
            "file_name": "BharathiB-React Js-3.6yrs-bengaluru.docx",
            "persona_name": "ai-developer-AD-role",
            "role_name": "AI Developer",
            "score_stages": [
                {
                    "id": "1f091f54-0953-4829-b560-a9c63be5522b",
                    "candidate_score_id": "f864dedb-3a1a-424f-9b54-65be67f13b23",
                    "stage_number": 1,
                    "method": "embedding_similarity",
                    "model": null,
                    "score": 62.45,
                    "threshold": 60,
                    "min_threshold": null,
                    "decision": "PASS_TO_STAGE2",
                    "reason": "Semantic match sufficient (62.5% ≥ 60.0%)",
                    "next_stage": "lightweight_screening",
                    "relevance_score": null,
                    "quick_assessment": null,
                    "skills_detected": null,
                    "roles_detected": null,
                    "key_matches": null,
                    "key_gaps": null
                },
                {
                    "id": "a22cb4b3-9496-46f1-8e20-a4d2aebb2217",
                    "candidate_score_id": "f864dedb-3a1a-424f-9b54-65be67f13b23",
                    "stage_number": 2,
                    "method": "lightweight_llm",
                    "model": "gpt-4o-mini",
                    "score": 0,
                    "threshold": null,
                    "min_threshold": 70,
                    "decision": "PASS_TO_STAGE3",
                    "reason": "Borderline match (78% in 70-80% range)",
                    "next_stage": "detailed_scoring",
                    "relevance_score": 78,
                    "quick_assessment": "The candidate has relevant experience in frontend development with a strong focus on React JS, which aligns well with the technical requirements. However, there are some gaps in leadership skills and foundational behaviors that could limit their fit for more senior roles.",
                    "skills_detected": [
                        "React JS",
                        "JavaScript",
                        "TypeScript",
                        "HTML",
                        "CSS",
                        "SCSS",
                        "Bootstrap",
                        "DOM Manipulation",
                        "Agile",
                        "JIRA",
                        "Git",
                        "GitHub",
                        "Problem Solving",
                        "UI/UX Design",
                        "Responsive Web Design",
                        "Single Page Applications (SPA)",
                        "React Hooks",
                        "RESTful APIs",
                        "Performance Optimization",
                        "Collaboration",
                        "Attention to Detail",
                        "Object-Oriented Programming"
                    ],
                    "roles_detected": [
                        "Frontend Developer",
                        "React JS Developer",
                        "UI Developer",
                        "Web Developer",
                        "Software Engineer",
                        "Full Stack Developer",
                        "Technical Lead"
                    ],
                    "key_matches": [
                        "Strong experience with React JS and frontend frameworks",
                        "Proficient in UI development and responsive design",
                        "Experience in Agile methodologies and collaboration"
                    ],
                    "key_gaps": [
                        "Limited experience in leadership and mentoring roles",
                        "No advanced certifications or significant academic qualifications",
                        "Lacks explicit problem-solving and design thinking experience at higher levels"
                    ]
                },
                {
                    "id": "fbcc66ec-6846-40dd-a05e-ef549539974a",
                    "candidate_score_id": "f864dedb-3a1a-424f-9b54-65be67f13b23",
                    "stage_number": 3,
                    "method": "detailed_llm",
                    "model": "gpt-4o",
                    "score": 0,
                    "threshold": null,
                    "min_threshold": null,
                    "decision": "",
                    "reason": null,
                    "next_stage": null,
                    "relevance_score": null,
                    "quick_assessment": null,
                    "skills_detected": null,
                    "roles_detected": null,
                    "key_matches": null,
                    "key_gaps": null
                }
            ],
            "categories": [
                {
                    "id": "5d939e00-1699-4280-9157-b6e66059c230",
                    "candidate_score_id": "f864dedb-3a1a-424f-9b54-65be67f13b23",
                    "category_name": "Technical Skills",
                    "weight_percentage": 35,
                    "category_score_percentage": 59.7,
                    "category_contribution": 20.89,
                    "subcategories": [
                        {
                            "id": "420bb71d-e864-4708-97fa-4e68b5aad7c2",
                            "category_id": "5d939e00-1699-4280-9157-b6e66059c230",
                            "subcategory_name": "Frontend Frameworks",
                            "weight_percentage": 30,
                            "expected_level": 5,
                            "actual_level": 3,
                            "base_score": 70,
                            "missing_count": 3,
                            "scored_percentage": 52,
                            "notes": "The CV shows strong experience with React ('Hands-on work experience in React JS, Hooks, React Forms, Router'), but there is no mention of Next.js, Vue.js, or Angular. The candidate has deep expertise in React, but the lack of other frameworks significantly reduces coverage. Evidence is specific to React, with no breadth across other frameworks, which is critical for this subcategory."
                        },
                        {
                            "id": "0202d8ae-c709-43b9-8a4f-2f4d8a4bf11a",
                            "category_id": "5d939e00-1699-4280-9157-b6e66059c230",
                            "subcategory_name": "JavaScript & TypeScript",
                            "weight_percentage": 25,
                            "expected_level": 5,
                            "actual_level": 3,
                            "base_score": 70,
                            "missing_count": 1,
                            "scored_percentage": 68,
                            "notes": "The CV mentions JavaScript and ES6 ('Created dynamic validation code using JavaScript', 'Technologies | JavaScript, ES6'), but there is no mention of TypeScript or Node.js. The candidate has solid experience with JavaScript, but the absence of TypeScript and Node.js limits the depth and breadth required for this subcategory."
                        },
                        {
                            "id": "38fb36a5-0ab1-4894-b5e1-4337bdc089f6",
                            "category_id": "5d939e00-1699-4280-9157-b6e66059c230",
                            "subcategory_name": "UI Development & Styling",
                            "weight_percentage": 25,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 75,
                            "missing_count": 2,
                            "scored_percentage": 70,
                            "notes": "The CV mentions HTML5 and CSS3 ('Translated the UI/UX design wireframes to actual code using HTML5, CSS/SCSS'), but there is no mention of Tailwind, Sass, or Styled Components. The candidate has solid experience with HTML and CSS, but the lack of other styling frameworks/tools reduces the overall coverage."
                        },
                        {
                            "id": "3d52c5e2-6fb9-4314-a5f8-cc98f6abe52f",
                            "category_id": "5d939e00-1699-4280-9157-b6e66059c230",
                            "subcategory_name": "Performance & Optimization",
                            "weight_percentage": 20,
                            "expected_level": 4,
                            "actual_level": 2,
                            "base_score": 60,
                            "missing_count": 3,
                            "scored_percentage": 48,
                            "notes": "The CV mentions 'Optimized application for maximum speed and scalability using React Lazy Loading', but there is no mention of Lighthouse, Core Web Vitals, or Code Splitting. The candidate has some experience with optimization techniques, but the lack of broader performance tools and metrics limits the depth and breadth in this subcategory."
                        }
                    ]
                },
                {
                    "id": "e32438c6-d21f-4dc4-a434-8c0a9bfa61bd",
                    "candidate_score_id": "f864dedb-3a1a-424f-9b54-65be67f13b23",
                    "category_name": "Cognitive Demands",
                    "weight_percentage": 15,
                    "category_score_percentage": 79.8,
                    "category_contribution": 11.97,
                    "subcategories": [
                        {
                            "id": "318b66ac-3d1a-4642-a229-a5f21a254158",
                            "category_id": "e32438c6-d21f-4dc4-a434-8c0a9bfa61bd",
                            "subcategory_name": "Problem Solving",
                            "weight_percentage": 40,
                            "expected_level": 5,
                            "actual_level": 4,
                            "base_score": 85,
                            "missing_count": 1,
                            "scored_percentage": 82,
                            "notes": "The CV demonstrates strong problem-solving skills through the candidate's experience in troubleshooting applications, analyzing and diagnosing application outages, and resolving conflicts. Evidence includes 'Troubleshooting the application to analyze and diagnose application outages and failures, and resolving conflicts.' However, there is no explicit mention of leadership in problem-solving or architect-level problem-solving, which is expected at level 5. The coverage is good but not complete, missing some critical elements of expert-level problem-solving."
                        },
                        {
                            "id": "04c608ed-8c0a-4393-820a-a5214a3eb6b3",
                            "category_id": "e32438c6-d21f-4dc4-a434-8c0a9bfa61bd",
                            "subcategory_name": "Design Thinking",
                            "weight_percentage": 35,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 75,
                            "missing_count": 2,
                            "scored_percentage": 70,
                            "notes": "The candidate has experience in designing user interfaces and translating UI/UX design wireframes into actual code, as seen in 'Translated the UI/UX design wireframes to actual code that will produce visual elements of the application.' However, there is limited evidence of advanced design thinking processes such as iterative design, prototyping, or user-centered design approaches. The CV lacks depth in demonstrating complex design thinking skills, which are expected at level 4."
                        },
                        {
                            "id": "d610fbee-d553-46e8-b65f-0952d09479db",
                            "category_id": "e32438c6-d21f-4dc4-a434-8c0a9bfa61bd",
                            "subcategory_name": "Attention to Detail",
                            "weight_percentage": 25,
                            "expected_level": 4,
                            "actual_level": 4,
                            "base_score": 90,
                            "missing_count": 0,
                            "scored_percentage": 90,
                            "notes": "The CV shows strong attention to detail through the candidate's work in optimizing applications for speed and scalability, fixing console warnings, and ensuring non-blocking React code. Evidence includes 'Optimized application for maximum speed and scalability using React Lazy Loading' and 'Developed the non-blocking React code and fixed the console warnings before merging the code into base branch.' The coverage is high, and the evidence supports an advanced level of attention to detail."
                        }
                    ]
                },
                {
                    "id": "4b63e85c-a1de-462a-9249-3da01760fe55",
                    "candidate_score_id": "f864dedb-3a1a-424f-9b54-65be67f13b23",
                    "category_name": "Values (Schwartz)",
                    "weight_percentage": 10,
                    "category_score_percentage": 78.2,
                    "category_contribution": 7.82,
                    "subcategories": [
                        {
                            "id": "5b57b137-268d-4589-b60f-5c3a6b15ff2d",
                            "category_id": "4b63e85c-a1de-462a-9249-3da01760fe55",
                            "subcategory_name": "Creativity & Self-Direction",
                            "weight_percentage": 35,
                            "expected_level": 4,
                            "actual_level": 4,
                            "base_score": 90,
                            "missing_count": 1,
                            "scored_percentage": 88,
                            "notes": "The CV demonstrates strong creativity and self-direction through the development of new user-facing features and reusable components using React JSX. The candidate has been involved in improving architecture and fine-tuning it by tracking emerging technologies, which indicates self-direction. Evidence includes 'Improving the architecture and fine tuning it by tracking emerging technologies' and 'Developed new user facing features, Built reusable components and libraries using React JSX.' However, there is a slight lack of explicit mention of leading innovative projects independently, which slightly affects the coverage."
                        },
                        {
                            "id": "b092fcbe-f711-41bc-a513-c822ffb2ad20",
                            "category_id": "4b63e85c-a1de-462a-9249-3da01760fe55",
                            "subcategory_name": "Achievement",
                            "weight_percentage": 25,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 75,
                            "missing_count": 2,
                            "scored_percentage": 72,
                            "notes": "The candidate shows achievement through their role in developing significant projects like the Honda Sales Application and Health Care Management. However, there is limited evidence of specific achievements such as awards, recognitions, or significant project outcomes. The CV mentions 'Translated the UI/UX design wireframes to actual code' and 'Optimized application for maximum speed and scalability,' but lacks quantifiable achievements or leadership in achieving project goals."
                        },
                        {
                            "id": "2c137b59-7c2b-4e8f-b55f-9f83c8f88f7d",
                            "category_id": "4b63e85c-a1de-462a-9249-3da01760fe55",
                            "subcategory_name": "Benevolence",
                            "weight_percentage": 20,
                            "expected_level": 3,
                            "actual_level": 2,
                            "base_score": 65,
                            "missing_count": 2,
                            "scored_percentage": 60,
                            "notes": "The CV provides limited evidence of benevolence. While the candidate has worked in teams and coordinated with backend teams, there is no explicit mention of activities that demonstrate a strong commitment to helping others or community involvement. The evidence includes 'Participated in Sprint ceremonies Sprint planning, daily scrum, Sprint Review and Sprint Retrospective,' but lacks specific examples of mentoring or community-oriented projects."
                        },
                        {
                            "id": "eebc810a-d479-43cf-82c5-5975e99ba352",
                            "category_id": "4b63e85c-a1de-462a-9249-3da01760fe55",
                            "subcategory_name": "Conformity",
                            "weight_percentage": 20,
                            "expected_level": 2,
                            "actual_level": 3,
                            "base_score": 85,
                            "missing_count": 0,
                            "scored_percentage": 87,
                            "notes": "The candidate demonstrates conformity through adherence to Agile methodologies and participation in structured team processes. Evidence includes 'Participated in Sprint ceremonies Sprint planning, daily scrum, Sprint Review and Sprint Retrospective' and 'Gathered and Analyzed the requirements from the Team Lead.' The candidate's experience in structured environments and following established processes indicates a higher level of conformity than expected."
                        }
                    ]
                },
                {
                    "id": "caddc92e-3f5b-4221-89a4-a274b463f0ce",
                    "candidate_score_id": "f864dedb-3a1a-424f-9b54-65be67f13b23",
                    "category_name": "Foundational Behaviors",
                    "weight_percentage": 15,
                    "category_score_percentage": 85.7,
                    "category_contribution": 12.86,
                    "subcategories": [
                        {
                            "id": "38110fe3-9899-41b1-b115-130290371870",
                            "category_id": "caddc92e-3f5b-4221-89a4-a274b463f0ce",
                            "subcategory_name": "Collaboration",
                            "weight_percentage": 35,
                            "expected_level": 4,
                            "actual_level": 4,
                            "base_score": 90,
                            "missing_count": 1,
                            "scored_percentage": 88,
                            "notes": "The CV demonstrates strong collaboration skills through participation in 'Sprint ceremonies Sprint planning, daily scrum, Sprint Review and Sprint Retrospective' and 'Co-Ordinated with the backend team'. The candidate has recent and relevant experience in collaborative environments, particularly in Agile settings. However, there is limited explicit mention of mentoring or leading teams, which slightly affects the coverage ratio."
                        },
                        {
                            "id": "5fc81ac9-2358-442b-805f-fb62dcd9cad4",
                            "category_id": "caddc92e-3f5b-4221-89a4-a274b463f0ce",
                            "subcategory_name": "Adaptability",
                            "weight_percentage": 35,
                            "expected_level": 4,
                            "actual_level": 4,
                            "base_score": 92,
                            "missing_count": 1,
                            "scored_percentage": 90,
                            "notes": "The candidate shows adaptability through 'Improving the architecture and fine tuning it by tracking emerging technologies' and 'Troubleshooting the application to analyze and diagnose application outages and failures'. The experience is recent and relevant, demonstrating the ability to adapt to new technologies and troubleshoot effectively. The coverage is slightly impacted by the lack of explicit examples of adapting to different roles or environments."
                        },
                        {
                            "id": "03018182-8332-49ca-9dca-553daff0e3d5",
                            "category_id": "caddc92e-3f5b-4221-89a4-a274b463f0ce",
                            "subcategory_name": "Ownership",
                            "weight_percentage": 30,
                            "expected_level": 5,
                            "actual_level": 4,
                            "base_score": 80,
                            "missing_count": 2,
                            "scored_percentage": 78,
                            "notes": "The CV indicates a strong sense of ownership through responsibilities like 'Developed new user facing features, Built reusable components and libraries using React JSX' and 'Integrated RESTful services (API’s) with the UI Components'. However, the candidate does not explicitly demonstrate leadership or full ownership of projects, which is expected at level 5. The experience is recent and relevant, but the lack of evidence of leading projects or teams affects the score."
                        }
                    ]
                },
                {
                    "id": "0b7c4b5b-fb5f-471f-a9f1-f65b2fe3627d",
                    "candidate_score_id": "f864dedb-3a1a-424f-9b54-65be67f13b23",
                    "category_name": "Leadership Skills",
                    "weight_percentage": 15,
                    "category_score_percentage": 66.8,
                    "category_contribution": 10.02,
                    "subcategories": [
                        {
                            "id": "cd9474f3-2636-4215-8e2f-e9b05f519c72",
                            "category_id": "0b7c4b5b-fb5f-471f-a9f1-f65b2fe3627d",
                            "subcategory_name": "Mentoring & Peer Review",
                            "weight_percentage": 40,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 75,
                            "missing_count": 1,
                            "scored_percentage": 68,
                            "notes": "The CV mentions 'Extensively involved in leading the design, schedule, assignments, code reviews using Agile,' which indicates some level of mentoring and peer review. However, there is no specific mention of mentoring others or peer review activities beyond this statement. The evidence suggests a solid working knowledge but lacks depth in mentoring others, which is critical for a Level 4. Therefore, the actual level is assessed as 3, with a base score of 75. The coverage is limited, leading to a final score of 68%."
                        },
                        {
                            "id": "83c261e5-c1ae-421a-8928-838786b02281",
                            "category_id": "0b7c4b5b-fb5f-471f-a9f1-f65b2fe3627d",
                            "subcategory_name": "Decision Making",
                            "weight_percentage": 30,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 78,
                            "missing_count": 1,
                            "scored_percentage": 72,
                            "notes": "The CV shows involvement in decision-making processes through statements like 'Improving the architecture and fine tuning it by tracking emerging technologies and evaluating their applicability to meet the business goals.' This indicates some decision-making experience, but it lacks evidence of complex decision-making or leadership in decision-making processes. The actual level is assessed as 3, with a base score of 78. The coverage is moderate, resulting in a final score of 72%."
                        },
                        {
                            "id": "e2035ece-8d60-4906-9a84-9d1b9ea2ab57",
                            "category_id": "0b7c4b5b-fb5f-471f-a9f1-f65b2fe3627d",
                            "subcategory_name": "Strategic Vision",
                            "weight_percentage": 30,
                            "expected_level": 3,
                            "actual_level": 2,
                            "base_score": 65,
                            "missing_count": 1,
                            "scored_percentage": 60,
                            "notes": "The CV does not provide strong evidence of strategic vision. The mention of 'tracking emerging technologies and evaluating their applicability to meet the business goals' suggests some strategic thinking, but it is not sufficient to demonstrate a solid strategic vision. The actual level is assessed as 2, with a base score of 65. The coverage is low, leading to a final score of 60%."
                        }
                    ]
                },
                {
                    "id": "06e61334-a41a-4caa-a9ff-07d532634925",
                    "candidate_score_id": "f864dedb-3a1a-424f-9b54-65be67f13b23",
                    "category_name": "Education and Experience",
                    "weight_percentage": 10,
                    "category_score_percentage": 52.2,
                    "category_contribution": 5.22,
                    "subcategories": [
                        {
                            "id": "31a35aca-8bd2-43a1-a3ec-bbe013eca42c",
                            "category_id": "06e61334-a41a-4caa-a9ff-07d532634925",
                            "subcategory_name": "Academic Qualification",
                            "weight_percentage": 40,
                            "expected_level": 2,
                            "actual_level": 1,
                            "base_score": 50,
                            "missing_count": 1,
                            "scored_percentage": 45,
                            "notes": "The candidate holds a Master of Business Administration, which is not directly related to the technical field of React JS development. This indicates a basic level of academic qualification in the relevant area, falling below the expected level of 2. The CV lacks any mention of a technical degree or coursework related to computer science or software development, which is a critical missing element for this role."
                        },
                        {
                            "id": "acd62a7d-a3c2-4b95-b64c-8f198546d444",
                            "category_id": "06e61334-a41a-4caa-a9ff-07d532634925",
                            "subcategory_name": "Years of Experience",
                            "weight_percentage": 40,
                            "expected_level": 5,
                            "actual_level": 3,
                            "base_score": 70,
                            "missing_count": 1,
                            "scored_percentage": 68,
                            "notes": "The candidate has 3.6 years of experience in React JS development, which is solid but falls short of the expected level 5. The experience is recent and relevant, with roles at Capgemini and Whitefield Motors Pvt Ltd. However, the years of experience do not meet the expected level of 5, which typically requires more than 5 years of experience. The candidate's experience is intermediate, with evidence of independent project work but not at an expert or leadership level."
                        },
                        {
                            "id": "21da417c-bae0-45fb-ab66-2d93c08fc65a",
                            "category_id": "06e61334-a41a-4caa-a9ff-07d532634925",
                            "subcategory_name": "Certifications & Portfolio",
                            "weight_percentage": 20,
                            "expected_level": 3,
                            "actual_level": 1,
                            "base_score": 40,
                            "missing_count": 2,
                            "scored_percentage": 35,
                            "notes": "The CV does not mention any certifications or a portfolio, which are critical for demonstrating expertise and practical skills in the field. This results in a significant gap, as the expected level is 3, indicating a need for intermediate-level certifications or a demonstrable portfolio of work. The absence of these elements suggests a lack of formal recognition or evidence of skills beyond work experience."
                        }
                    ]
                }
            ],
            "insights": [
                {
                    "id": "638dccef-54bc-4ce0-b87e-a2b6b15cb725",
                    "candidate_score_id": "f864dedb-3a1a-424f-9b54-65be67f13b23",
                    "insight_type": "STRENGTH",
                    "insight_text": "Proficient in React JS and its ecosystem, including hooks, Redux, and SPA development, as evidenced by extensive project experience."
                },
                {
                    "id": "9b3a06e3-01b1-4db6-b9a0-b23f550dd16f",
                    "candidate_score_id": "f864dedb-3a1a-424f-9b54-65be67f13b23",
                    "insight_type": "STRENGTH",
                    "insight_text": "Strong foundational behaviors with a score of 85.7%, indicating reliability and consistency in work performance."
                },
                {
                    "id": "e027fab1-1d0f-47f6-b532-c42e22f9bbc5",
                    "candidate_score_id": "f864dedb-3a1a-424f-9b54-65be67f13b23",
                    "insight_type": "STRENGTH",
                    "insight_text": "High cognitive demands score of 79.8%, suggesting strong problem-solving and analytical skills."
                },
                {
                    "id": "7dec11bc-ef8c-4434-8d84-66f44b575186",
                    "candidate_score_id": "f864dedb-3a1a-424f-9b54-65be67f13b23",
                    "insight_type": "GAP",
                    "insight_text": "Technical skills score of 59.7% indicates room for improvement in advanced technical competencies or broader technology stack knowledge."
                },
                {
                    "id": "0702b49f-5d1a-498a-85d7-f726f012ca54",
                    "candidate_score_id": "f864dedb-3a1a-424f-9b54-65be67f13b23",
                    "insight_type": "GAP",
                    "insight_text": "Education and experience score of 52.2% suggests limited experience or educational background relative to the role's requirements."
                },
                {
                    "id": "a53a7fd2-a6c5-4914-9f49-95af9b9fb8b0",
                    "candidate_score_id": "f864dedb-3a1a-424f-9b54-65be67f13b23",
                    "insight_type": "GAP",
                    "insight_text": "Leadership skills score of 66.8% could be enhanced to better align with roles requiring team leadership or project management."
                }
            ]
        },
        {
            "id": "8f8f4fde-abe8-4e60-a71a-5e8c898d5927",
            "candidate_id": "1406c7f6-7c5f-4612-9da7-9b0d1bd471a2",
            "persona_id": "2fcac866-3d67-4312-96ff-3bf832bb8419",
            "cv_id": "6f8a4c28-62e4-4b74-b7a7-1eeaec5df6bf",
            "pipeline_stage_reached": 3,
            "final_score": 66.81,
            "final_decision": "MODERATE_FIT",
            "embedding_score": 65.37,
            "lightweight_llm_score": 75,
            "detailed_llm_score": 66.81,
            "scored_at": "2025-10-27T13:13:33",
            "scoring_version": "v1.0",
            "processing_time_ms": 38321,
            "candidate_name": "B BHARATHI",
            "file_name": "BharathiB-React Js-3.6yrs-bengaluru.docx",
            "persona_name": "persona-ai-developer",
            "role_name": "AI Developer",
            "score_stages": [
                {
                    "id": "74898489-ee65-470e-8f30-817de45e3d00",
                    "candidate_score_id": "8f8f4fde-abe8-4e60-a71a-5e8c898d5927",
                    "stage_number": 1,
                    "method": "embedding_similarity",
                    "model": null,
                    "score": 65.37,
                    "threshold": 60,
                    "min_threshold": null,
                    "decision": "PASS_TO_STAGE2",
                    "reason": "Semantic match sufficient (65.4% ≥ 60.0%)",
                    "next_stage": "lightweight_screening",
                    "relevance_score": null,
                    "quick_assessment": null,
                    "skills_detected": null,
                    "roles_detected": null,
                    "key_matches": null,
                    "key_gaps": null
                },
                {
                    "id": "0fb544d8-9145-4461-846f-5feb7d30a6af",
                    "candidate_score_id": "8f8f4fde-abe8-4e60-a71a-5e8c898d5927",
                    "stage_number": 2,
                    "method": "lightweight_llm",
                    "model": "gpt-4o-mini",
                    "score": 0,
                    "threshold": null,
                    "min_threshold": 70,
                    "decision": "PASS_TO_STAGE3",
                    "reason": "Borderline match (75% in 70-80% range)",
                    "next_stage": "detailed_scoring",
                    "relevance_score": 75,
                    "quick_assessment": "The candidate has relevant experience in React JS development and UI design, with a solid understanding of frontend frameworks and performance optimization. However, the lack of specific experience in JavaScript & TypeScript and leadership skills may limit their fit for more senior roles.",
                    "skills_detected": [
                        "React JS",
                        "JavaScript",
                        "HTML",
                        "CSS",
                        "SCSS",
                        "Bootstrap",
                        "Agile",
                        "DOM Analysis",
                        "Single Page Applications (SPA)",
                        "React Hooks",
                        "RESTful APIs",
                        "Performance Optimization",
                        "User Interface (UI) Design",
                        "Code Reviews",
                        "Collaboration",
                        "Problem Solving",
                        "Attention to Detail",
                        "Adaptability",
                        "Ownership",
                        "Mentoring",
                        "Decision Making"
                    ],
                    "roles_detected": [
                        "Frontend Developer",
                        "React JS Developer",
                        "UI Developer",
                        "Web Developer",
                        "Software Engineer",
                        "Full Stack Developer",
                        "Technical Lead"
                    ],
                    "key_matches": [
                        "Strong experience in React JS and UI development",
                        "Proficient in performance optimization and responsive design",
                        "Experience in Agile methodology and code reviews"
                    ],
                    "key_gaps": [
                        "Limited experience with TypeScript",
                        "Lack of advanced leadership skills",
                        "No formal academic qualification in a technical field"
                    ]
                },
                {
                    "id": "413fde91-8f24-4eea-9bda-d869904e2ac6",
                    "candidate_score_id": "8f8f4fde-abe8-4e60-a71a-5e8c898d5927",
                    "stage_number": 3,
                    "method": "detailed_llm",
                    "model": "gpt-4o",
                    "score": 0,
                    "threshold": null,
                    "min_threshold": null,
                    "decision": "",
                    "reason": null,
                    "next_stage": null,
                    "relevance_score": null,
                    "quick_assessment": null,
                    "skills_detected": null,
                    "roles_detected": null,
                    "key_matches": null,
                    "key_gaps": null
                }
            ],
            "categories": [
                {
                    "id": "261f3f09-1ddb-4e03-b455-f30de81f7061",
                    "candidate_score_id": "8f8f4fde-abe8-4e60-a71a-5e8c898d5927",
                    "category_name": "Technical Skills",
                    "weight_percentage": 35,
                    "category_score_percentage": 60.1,
                    "category_contribution": 21.04,
                    "subcategories": [
                        {
                            "id": "ca25ee1e-56a6-4258-824b-f48abaeb14d1",
                            "category_id": "261f3f09-1ddb-4e03-b455-f30de81f7061",
                            "subcategory_name": "Frontend Frameworks",
                            "weight_percentage": 30,
                            "expected_level": 5,
                            "actual_level": 3,
                            "base_score": 70,
                            "missing_count": 3,
                            "scored_percentage": 52,
                            "notes": "The CV shows strong expertise in React, with multiple mentions of production experience and specific projects. However, there is no evidence of experience with Next.js, Vue.js, or Angular. The candidate demonstrates depth in React but lacks breadth across other required frameworks. Evidence: 'Hands-on work experience in React JS, Hooks, React Forms, Router.'"
                        },
                        {
                            "id": "fdae9669-1635-4fdf-9667-643e635d8264",
                            "category_id": "261f3f09-1ddb-4e03-b455-f30de81f7061",
                            "subcategory_name": "JavaScript & TypeScript",
                            "weight_percentage": 25,
                            "expected_level": 5,
                            "actual_level": 3,
                            "base_score": 70,
                            "missing_count": 1,
                            "scored_percentage": 68,
                            "notes": "The CV mentions JavaScript (ES6) and some JavaScript-related tools like Redux and JSON, indicating solid experience. However, there is no mention of TypeScript or Node.js. The candidate has a good foundation in JavaScript but lacks coverage in TypeScript and Node.js. Evidence: 'Technologies | ReactJS, Redux, Redux-Thunk, JavaScript, ES6, JSON, HTML/HTML5, CSS3.'"
                        },
                        {
                            "id": "4b790d33-4d6b-4683-9dfd-d7554a1b0b60",
                            "category_id": "261f3f09-1ddb-4e03-b455-f30de81f7061",
                            "subcategory_name": "UI Development & Styling",
                            "weight_percentage": 25,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 75,
                            "missing_count": 2,
                            "scored_percentage": 70,
                            "notes": "The CV shows experience with HTML5 and CSS3, and mentions Bootstrap, but lacks evidence of Tailwind, Sass, and Styled Components. The candidate has solid experience in basic UI development and styling but is missing advanced styling frameworks. Evidence: 'Translated the UI/UX design wireframes to actual code that will produce visual elements of the application using HTML5, CSS/SCSS, and Bootstrap 4.'"
                        },
                        {
                            "id": "da15589c-01e9-4d0f-9d31-12f515efd47b",
                            "category_id": "261f3f09-1ddb-4e03-b455-f30de81f7061",
                            "subcategory_name": "Performance & Optimization",
                            "weight_percentage": 20,
                            "expected_level": 4,
                            "actual_level": 2,
                            "base_score": 60,
                            "missing_count": 3,
                            "scored_percentage": 50,
                            "notes": "The CV mentions 'Optimized application for maximum speed and scalability using React Lazy Loading,' indicating some experience with performance optimization. However, there is no mention of Lighthouse, Core Web Vitals, or Code Splitting. The candidate has limited experience in this area. Evidence: 'Optimized application for maximum speed and scalability using React Lazy Loading.'"
                        }
                    ]
                },
                {
                    "id": "d77249aa-a1a8-45b8-bf51-37ad4a347dbb",
                    "candidate_score_id": "8f8f4fde-abe8-4e60-a71a-5e8c898d5927",
                    "category_name": "Cognitive Demands",
                    "weight_percentage": 15,
                    "category_score_percentage": 77.85,
                    "category_contribution": 11.68,
                    "subcategories": [
                        {
                            "id": "761e9f1a-3054-4c01-b751-051e49e1aa92",
                            "category_id": "d77249aa-a1a8-45b8-bf51-37ad4a347dbb",
                            "subcategory_name": "Problem Solving",
                            "weight_percentage": 40,
                            "expected_level": 5,
                            "actual_level": 4,
                            "base_score": 85,
                            "missing_count": 1,
                            "scored_percentage": 82,
                            "notes": "The CV demonstrates strong problem-solving skills through various projects, such as 'Improving the architecture and fine tuning it by tracking emerging technologies' and 'Troubleshooting the application to analyze and diagnose application outages and failures.' However, it lacks explicit evidence of leadership in problem-solving or tackling highly complex issues, which would be expected at an expert level (Level 5). The experience is recent and relevant, but the depth is more aligned with advanced production experience rather than expert mastery."
                        },
                        {
                            "id": "1aeb58ee-a010-4a5f-911e-49d877b70449",
                            "category_id": "d77249aa-a1a8-45b8-bf51-37ad4a347dbb",
                            "subcategory_name": "Design Thinking",
                            "weight_percentage": 35,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 75,
                            "missing_count": 2,
                            "scored_percentage": 68,
                            "notes": "The CV mentions 'Translated the UI/UX design wireframes to actual code' and 'Designed and integrated web services / APIs,' indicating some design thinking capability. However, it lacks comprehensive evidence of advanced design thinking processes or methodologies, such as user research or iterative prototyping. The coverage is limited to implementation rather than the full design thinking process, which is why it is assessed at an intermediate level (Level 3)."
                        },
                        {
                            "id": "772d9668-e0fa-4f44-9d99-c7cd34e0e9d1",
                            "category_id": "d77249aa-a1a8-45b8-bf51-37ad4a347dbb",
                            "subcategory_name": "Attention to Detail",
                            "weight_percentage": 25,
                            "expected_level": 4,
                            "actual_level": 4,
                            "base_score": 88,
                            "missing_count": 1,
                            "scored_percentage": 85,
                            "notes": "The CV provides evidence of attention to detail through statements like 'Developed the non-blocking React code and fixed the console warnings before merging the code into base branch' and 'Optimized application for maximum speed and scalability.' These examples show a strong focus on detail-oriented tasks. However, there is a slight lack of explicit metrics or outcomes that would demonstrate exceptional attention to detail, keeping the score within the advanced range."
                        }
                    ]
                },
                {
                    "id": "95c338d2-3652-40ae-8e15-a56808f4f3c0",
                    "candidate_score_id": "8f8f4fde-abe8-4e60-a71a-5e8c898d5927",
                    "category_name": "Values (Schwartz)",
                    "weight_percentage": 10,
                    "category_score_percentage": 83.3,
                    "category_contribution": 8.33,
                    "subcategories": [
                        {
                            "id": "408f35c8-1960-4bcf-9db9-1cf3c8ece69f",
                            "category_id": "95c338d2-3652-40ae-8e15-a56808f4f3c0",
                            "subcategory_name": "Creativity & Self-Direction",
                            "weight_percentage": 35,
                            "expected_level": 4,
                            "actual_level": 4,
                            "base_score": 90,
                            "missing_count": 1,
                            "scored_percentage": 88,
                            "notes": "The candidate demonstrates advanced production experience with React JS, including creating interactive UIs and optimizing applications for speed and scalability. Evidence includes 'Developed new user facing features, Built reusable components and libraries using React JSX' and 'Optimized application for maximum speed and scalability using React Lazy Loading.' However, there is limited mention of self-direction in terms of initiating or leading innovative projects independently, which slightly affects the coverage ratio."
                        },
                        {
                            "id": "b1b76af4-ee68-480c-ad11-6bef2d7fcab1",
                            "category_id": "95c338d2-3652-40ae-8e15-a56808f4f3c0",
                            "subcategory_name": "Achievement",
                            "weight_percentage": 25,
                            "expected_level": 4,
                            "actual_level": 4,
                            "base_score": 88,
                            "missing_count": 1,
                            "scored_percentage": 86,
                            "notes": "The candidate shows strong evidence of achievement through roles in significant projects such as 'Honda Sales Application Development' and 'Health Care Management.' They have 'Extensively involved in leading the design, schedule, assignments, code reviews using Agile,' indicating a high level of responsibility and achievement. However, specific metrics or outcomes that quantify these achievements are not provided, which slightly reduces the coverage."
                        },
                        {
                            "id": "f2aaf7f9-6c1c-4069-9d93-73b529afc759",
                            "category_id": "95c338d2-3652-40ae-8e15-a56808f4f3c0",
                            "subcategory_name": "Benevolence",
                            "weight_percentage": 20,
                            "expected_level": 3,
                            "actual_level": 2,
                            "base_score": 70,
                            "missing_count": 2,
                            "scored_percentage": 68,
                            "notes": "The CV lacks explicit evidence of benevolence, such as teamwork, mentoring, or community involvement. While the candidate 'Co-Ordinated with the backend team,' there is no mention of activities that directly support or enhance the welfare of others, which is critical for this subcategory. This results in a lower actual level and coverage ratio."
                        },
                        {
                            "id": "262d2678-6b77-4347-9a13-150f62e89e21",
                            "category_id": "95c338d2-3652-40ae-8e15-a56808f4f3c0",
                            "subcategory_name": "Conformity",
                            "weight_percentage": 20,
                            "expected_level": 2,
                            "actual_level": 3,
                            "base_score": 85,
                            "missing_count": 0,
                            "scored_percentage": 87,
                            "notes": "The candidate demonstrates a strong adherence to conformity through participation in 'Sprint ceremonies Sprint planning, daily scrum, Sprint Review and Sprint Retrospective,' and following established processes and standards in their work. This indicates a higher level of conformity than expected, as they consistently align with team and organizational norms."
                        }
                    ]
                },
                {
                    "id": "eeb5a5ff-6414-4181-9b63-3904a8802a54",
                    "candidate_score_id": "8f8f4fde-abe8-4e60-a71a-5e8c898d5927",
                    "category_name": "Foundational Behaviors",
                    "weight_percentage": 15,
                    "category_score_percentage": 68.5,
                    "category_contribution": 10.28,
                    "subcategories": [
                        {
                            "id": "2d63fe84-21c4-4087-957e-1d0417eab9f1",
                            "category_id": "eeb5a5ff-6414-4181-9b63-3904a8802a54",
                            "subcategory_name": "Collaboration",
                            "weight_percentage": 35,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 75,
                            "missing_count": 1,
                            "scored_percentage": 68,
                            "notes": "The CV mentions participation in 'Sprint ceremonies Sprint planning, daily scrum, Sprint Review and Sprint Retrospective' which indicates some level of collaboration. However, there is limited evidence of deeper collaboration such as leading teams or mentoring others. The mention of 'Co-Ordinated with the backend team' supports some collaborative work but lacks depth. Overall, the evidence suggests solid working knowledge but not at an advanced level."
                        },
                        {
                            "id": "52bcc524-c63b-4e66-8e99-f98d202e19c4",
                            "category_id": "eeb5a5ff-6414-4181-9b63-3904a8802a54",
                            "subcategory_name": "Adaptability",
                            "weight_percentage": 35,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 75,
                            "missing_count": 1,
                            "scored_percentage": 72,
                            "notes": "The CV shows adaptability through 'Improving the architecture and fine tuning it by tracking emerging technologies' and 'Troubleshooting the application to analyze and diagnose application outages and failures'. However, there is no strong evidence of handling significant changes or challenges in different environments. The experience is recent and relevant but lacks the complexity expected at level 4."
                        },
                        {
                            "id": "6619a8ee-977f-471c-a535-2f91266f70d7",
                            "category_id": "eeb5a5ff-6414-4181-9b63-3904a8802a54",
                            "subcategory_name": "Ownership",
                            "weight_percentage": 30,
                            "expected_level": 5,
                            "actual_level": 3,
                            "base_score": 70,
                            "missing_count": 2,
                            "scored_percentage": 65,
                            "notes": "The CV mentions responsibilities such as 'Developed new user facing features, Built reusable components and libraries using React JSX' and 'Translated the UI/UX design wireframes to actual code', indicating some level of ownership. However, there is no evidence of leading projects or taking full responsibility for outcomes, which is expected at level 5. The role descriptions suggest intermediate ownership rather than expert-level."
                        }
                    ]
                },
                {
                    "id": "4e7d26ec-0c57-43a2-bd7d-4e8386c1c97a",
                    "candidate_score_id": "8f8f4fde-abe8-4e60-a71a-5e8c898d5927",
                    "category_name": "Leadership Skills",
                    "weight_percentage": 15,
                    "category_score_percentage": 64.4,
                    "category_contribution": 9.66,
                    "subcategories": [
                        {
                            "id": "ca365ce0-1fc7-4258-9b6a-c6dba9e72052",
                            "category_id": "4e7d26ec-0c57-43a2-bd7d-4e8386c1c97a",
                            "subcategory_name": "Mentoring & Peer Review",
                            "weight_percentage": 40,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 75,
                            "missing_count": 1,
                            "scored_percentage": 68,
                            "notes": "The CV mentions 'Extensively involved in leading the design, schedule, assignments, code reviews using Agile,' which indicates some involvement in peer review processes. However, there is no explicit mention of mentoring others, which is a critical component of this subcategory. The evidence suggests a solid foundation but lacks depth in mentoring, leading to a level 3 assessment. The coverage is partial, as it covers peer review but not mentoring, resulting in a lower score."
                        },
                        {
                            "id": "a6205a04-acd0-4497-9d17-2be400fb7fd4",
                            "category_id": "4e7d26ec-0c57-43a2-bd7d-4e8386c1c97a",
                            "subcategory_name": "Decision Making",
                            "weight_percentage": 30,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 70,
                            "missing_count": 1,
                            "scored_percentage": 66,
                            "notes": "The CV provides evidence of decision-making in the context of 'Improving the architecture and fine tuning it by tracking emerging technologies and evaluating their applicability to meet the business goals.' This indicates involvement in decision-making processes, but it lacks explicit examples of complex or high-stakes decisions. The level is assessed at 3 due to the lack of depth in decision-making scenarios. The coverage is moderate, as it shows some decision-making but not at the expected complexity level."
                        },
                        {
                            "id": "2cc6e0bb-354c-47a4-ab17-6c6708103a9a",
                            "category_id": "4e7d26ec-0c57-43a2-bd7d-4e8386c1c97a",
                            "subcategory_name": "Strategic Vision",
                            "weight_percentage": 30,
                            "expected_level": 3,
                            "actual_level": 2,
                            "base_score": 60,
                            "missing_count": 1,
                            "scored_percentage": 58,
                            "notes": "The CV mentions 'tracking emerging technologies and evaluating their applicability to meet the business goals,' which suggests some strategic thinking. However, there is no strong evidence of a strategic vision or long-term planning. The level is assessed at 2, indicating basic exposure to strategic concepts but lacking depth and breadth. The coverage is low, as it only partially addresses strategic vision without concrete examples or outcomes."
                        }
                    ]
                },
                {
                    "id": "0371b2fc-ea6f-416a-8fba-383d4bccce80",
                    "candidate_score_id": "8f8f4fde-abe8-4e60-a71a-5e8c898d5927",
                    "category_name": "Education and Experience",
                    "weight_percentage": 10,
                    "category_score_percentage": 58.2,
                    "category_contribution": 5.82,
                    "subcategories": [
                        {
                            "id": "9da7cb04-6117-4b87-ab83-07d830142fb3",
                            "category_id": "0371b2fc-ea6f-416a-8fba-383d4bccce80",
                            "subcategory_name": "Academic Qualification",
                            "weight_percentage": 40,
                            "expected_level": 2,
                            "actual_level": 1,
                            "base_score": 60,
                            "missing_count": 1,
                            "scored_percentage": 55,
                            "notes": "The CV mentions a 'Master of Business Administration' but lacks details on the institution or relevance to the React JS Developer role. This indicates a basic level of academic qualification, which is below the expected level. The coverage is limited as there is no mention of relevant technical or computer science education."
                        },
                        {
                            "id": "7d363a2d-e799-469d-967c-697472e41213",
                            "category_id": "0371b2fc-ea6f-416a-8fba-383d4bccce80",
                            "subcategory_name": "Years of Experience",
                            "weight_percentage": 40,
                            "expected_level": 5,
                            "actual_level": 3,
                            "base_score": 70,
                            "missing_count": 1,
                            "scored_percentage": 68,
                            "notes": "The CV shows 3.6 years of experience in relevant roles ('Currently working as a React JS Developer in Capgemini since Oct-2022' and 'Previously worked as a UI Developer in whitefield motors pvt ltd since Jul-2017'). However, this falls short of the expected level 5, which would require more extensive experience. The experience is recent and relevant but not at the expert level."
                        },
                        {
                            "id": "86516e11-ef8e-4fbb-ae6b-2b038fd5b2a8",
                            "category_id": "0371b2fc-ea6f-416a-8fba-383d4bccce80",
                            "subcategory_name": "Certifications & Portfolio",
                            "weight_percentage": 20,
                            "expected_level": 3,
                            "actual_level": 1,
                            "base_score": 50,
                            "missing_count": 2,
                            "scored_percentage": 45,
                            "notes": "There is no mention of certifications or a portfolio in the CV, which are critical for demonstrating additional expertise and practical application. This results in a significant gap in this subcategory, leading to a score well below the expected level."
                        }
                    ]
                }
            ],
            "insights": [
                {
                    "id": "af240878-bb17-45ed-a8c5-afdf0f06687a",
                    "candidate_score_id": "8f8f4fde-abe8-4e60-a71a-5e8c898d5927",
                    "insight_type": "STRENGTH",
                    "insight_text": "Proficient in React JS, with hands-on experience in developing Single Page Applications (SPA) and using React components, hooks, and Redux."
                },
                {
                    "id": "534c107c-bf3d-4b0a-9190-55836f38d032",
                    "candidate_score_id": "8f8f4fde-abe8-4e60-a71a-5e8c898d5927",
                    "insight_type": "STRENGTH",
                    "insight_text": "Strong understanding of UI/UX design principles, demonstrated by translating wireframes into functional code using HTML5, CSS/SCSS, and Bootstrap."
                },
                {
                    "id": "f2164207-3b1b-4e0d-9e3f-23ab174fda07",
                    "candidate_score_id": "8f8f4fde-abe8-4e60-a71a-5e8c898d5927",
                    "insight_type": "STRENGTH",
                    "insight_text": "Experience in optimizing applications for speed and scalability, including the use of React Lazy Loading and troubleshooting application issues."
                },
                {
                    "id": "02011f2a-38c0-457f-85d3-1d8ca0050e87",
                    "candidate_score_id": "8f8f4fde-abe8-4e60-a71a-5e8c898d5927",
                    "insight_type": "STRENGTH",
                    "insight_text": "Active participation in Agile methodologies, including sprint planning and daily scrums, which shows good teamwork and project management skills."
                },
                {
                    "id": "1c58c2b4-a13a-44bd-a321-58c27d0ea9db",
                    "candidate_score_id": "8f8f4fde-abe8-4e60-a71a-5e8c898d5927",
                    "insight_type": "GAP",
                    "insight_text": "Technical skills score is relatively low at 60.1%, indicating potential areas for improvement in advanced React JS features or related technologies."
                },
                {
                    "id": "55739969-cc5e-4f7b-97c3-5a7d2eae0b6a",
                    "candidate_score_id": "8f8f4fde-abe8-4e60-a71a-5e8c898d5927",
                    "insight_type": "GAP",
                    "insight_text": "Education and experience score is 58.2%, suggesting a need for further development or diversification of experience beyond current roles."
                },
                {
                    "id": "e54a2ea3-b164-42ee-ae49-4bbf610a709f",
                    "candidate_score_id": "8f8f4fde-abe8-4e60-a71a-5e8c898d5927",
                    "insight_type": "GAP",
                    "insight_text": "Leadership skills are at 64.4%, indicating room for growth in leading teams or projects effectively."
                }
            ]
        },
        {
            "id": "a00bc4dd-e147-44a8-ab0b-4d043c849d67",
            "candidate_id": "1406c7f6-7c5f-4612-9da7-9b0d1bd471a2",
            "persona_id": "ecc4df73-3e37-4b7c-b0b8-0f05545ff0b4",
            "cv_id": "6f8a4c28-62e4-4b74-b7a7-1eeaec5df6bf",
            "pipeline_stage_reached": 3,
            "final_score": 71.7,
            "final_decision": "GOOD_FIT",
            "embedding_score": 65.59,
            "lightweight_llm_score": 75,
            "detailed_llm_score": 71.7,
            "scored_at": "2025-10-27T11:36:13",
            "scoring_version": "v1.0",
            "processing_time_ms": 40398,
            "candidate_name": "B BHARATHI",
            "file_name": "BharathiB-React Js-3.6yrs-bengaluru.docx",
            "persona_name": "AI Developerw",
            "role_name": "AI Developer",
            "score_stages": [
                {
                    "id": "06469bd3-5af8-4a33-b70d-2cb01eede47b",
                    "candidate_score_id": "a00bc4dd-e147-44a8-ab0b-4d043c849d67",
                    "stage_number": 1,
                    "method": "embedding_similarity",
                    "model": null,
                    "score": 65.59,
                    "threshold": 60,
                    "min_threshold": null,
                    "decision": "PASS_TO_STAGE2",
                    "reason": "Semantic match sufficient (65.6% ≥ 60.0%)",
                    "next_stage": "lightweight_screening",
                    "relevance_score": null,
                    "quick_assessment": null,
                    "skills_detected": null,
                    "roles_detected": null,
                    "key_matches": null,
                    "key_gaps": null
                },
                {
                    "id": "6620c44c-a1a1-4102-adf5-ed4eb65a37f3",
                    "candidate_score_id": "a00bc4dd-e147-44a8-ab0b-4d043c849d67",
                    "stage_number": 2,
                    "method": "lightweight_llm",
                    "model": "gpt-4o-mini",
                    "score": 0,
                    "threshold": null,
                    "min_threshold": 70,
                    "decision": "PASS_TO_STAGE3",
                    "reason": "Borderline match (75% in 70-80% range)",
                    "next_stage": "detailed_scoring",
                    "relevance_score": 75,
                    "quick_assessment": "The candidate has relevant experience in React JS development and UI design, aligning well with the technical skills required. However, there are gaps in leadership skills and foundational behaviors that may limit their fit for more senior roles.",
                    "skills_detected": [
                        "React JS",
                        "JavaScript",
                        "TypeScript",
                        "HTML",
                        "CSS",
                        "SCSS",
                        "Bootstrap",
                        "Agile",
                        "Git",
                        "GitHub",
                        "DOM Layout",
                        "Single Page Applications (SPA)",
                        "React Hooks",
                        "RESTful APIs",
                        "Performance Optimization",
                        "Problem Solving",
                        "Attention to Detail",
                        "Collaboration",
                        "Adaptability",
                        "Ownership"
                    ],
                    "roles_detected": [
                        "Frontend Developer",
                        "React JS Developer",
                        "UI Developer",
                        "Web Developer",
                        "Software Engineer",
                        "Full Stack Developer"
                    ],
                    "key_matches": [
                        "Strong experience in React JS and UI development",
                        "Proficient in JavaScript and TypeScript",
                        "Experience with Agile methodologies and collaboration"
                    ],
                    "key_gaps": [
                        "Limited experience in leadership and mentoring roles",
                        "No formal education in technical fields (only MBA)",
                        "Lacks advanced certifications in relevant technologies"
                    ]
                },
                {
                    "id": "abc194dd-d579-4188-9ae2-e61ea1b0a38f",
                    "candidate_score_id": "a00bc4dd-e147-44a8-ab0b-4d043c849d67",
                    "stage_number": 3,
                    "method": "detailed_llm",
                    "model": "gpt-4o",
                    "score": 0,
                    "threshold": null,
                    "min_threshold": null,
                    "decision": "",
                    "reason": null,
                    "next_stage": null,
                    "relevance_score": null,
                    "quick_assessment": null,
                    "skills_detected": null,
                    "roles_detected": null,
                    "key_matches": null,
                    "key_gaps": null
                }
            ],
            "categories": [
                {
                    "id": "d6552545-c2e6-4764-a22f-89b1c84f011e",
                    "candidate_score_id": "a00bc4dd-e147-44a8-ab0b-4d043c849d67",
                    "category_name": "Technical Skills",
                    "weight_percentage": 30,
                    "category_score_percentage": 65,
                    "category_contribution": 19.5,
                    "subcategories": [
                        {
                            "id": "d4cb4c49-fae4-4b8e-84d4-ee066aac2be1",
                            "category_id": "d6552545-c2e6-4764-a22f-89b1c84f011e",
                            "subcategory_name": "Frontend Frameworks",
                            "weight_percentage": 35,
                            "expected_level": 5,
                            "actual_level": 3,
                            "base_score": 70,
                            "missing_count": 3,
                            "scored_percentage": 60,
                            "notes": "The CV shows strong expertise in React ('Hands-on work experience in React JS, Hooks, React Forms, Router'), but there is no mention of Next.js, Vue.js, or Angular. The candidate has deep experience with React, but lacks breadth in other frontend frameworks. This results in a lower coverage ratio and missing critical items."
                        },
                        {
                            "id": "6aeb14fb-8b00-46aa-8274-d127e4ddc87a",
                            "category_id": "d6552545-c2e6-4764-a22f-89b1c84f011e",
                            "subcategory_name": "JavaScript & TypeScript",
                            "weight_percentage": 20,
                            "expected_level": 5,
                            "actual_level": 3,
                            "base_score": 70,
                            "missing_count": 1,
                            "scored_percentage": 75,
                            "notes": "The CV mentions JavaScript (ES6) and Node.js ('Created dynamic validation code using JavaScript', 'Technologies | JavaScript, ES6'), but there is no mention of TypeScript. The candidate has solid working knowledge and production experience with JavaScript, but the absence of TypeScript is a significant gap."
                        },
                        {
                            "id": "db526242-1561-4e87-9b38-c9012d72be18",
                            "category_id": "d6552545-c2e6-4764-a22f-89b1c84f011e",
                            "subcategory_name": "UI Development & Styling",
                            "weight_percentage": 25,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 75,
                            "missing_count": 2,
                            "scored_percentage": 72,
                            "notes": "The CV lists HTML5 and CSS3 ('Translated the UI/UX design wireframes to actual code using HTML5, CSS/SCSS'), but does not mention Tailwind, Sass, or Styled Components. The candidate has experience with basic UI development and styling, but lacks coverage in modern styling tools like Tailwind and Styled Components."
                        },
                        {
                            "id": "191376e1-70d8-48df-84cc-967a6f00e532",
                            "category_id": "d6552545-c2e6-4764-a22f-89b1c84f011e",
                            "subcategory_name": "Performance & Optimization",
                            "weight_percentage": 20,
                            "expected_level": 4,
                            "actual_level": 2,
                            "base_score": 60,
                            "missing_count": 3,
                            "scored_percentage": 55,
                            "notes": "The CV mentions 'Optimized application for maximum speed and scalability using React Lazy Loading', which covers Lazy Loading. However, there is no mention of Lighthouse, Core Web Vitals, or Code Splitting. The candidate has basic exposure to performance optimization but lacks depth and breadth in this area."
                        }
                    ]
                },
                {
                    "id": "30b80c55-c404-4136-aece-c38baf90acb6",
                    "candidate_score_id": "a00bc4dd-e147-44a8-ab0b-4d043c849d67",
                    "category_name": "Cognitive Demands",
                    "weight_percentage": 20,
                    "category_score_percentage": 80.6,
                    "category_contribution": 16.12,
                    "subcategories": [
                        {
                            "id": "7d383d1e-91ac-4a4d-a88f-76782f3cc04e",
                            "category_id": "30b80c55-c404-4136-aece-c38baf90acb6",
                            "subcategory_name": "Problem Solving",
                            "weight_percentage": 40,
                            "expected_level": 5,
                            "actual_level": 4,
                            "base_score": 88,
                            "missing_count": 1,
                            "scored_percentage": 84,
                            "notes": "The CV demonstrates strong problem-solving skills through experience in troubleshooting applications, analyzing and diagnosing application outages, and resolving conflicts. Evidence includes 'Troubleshooting the application to analyze and diagnose application outages and failures, and resolving conflicts.' However, it lacks explicit mention of leadership in problem-solving or architect-level mastery, which is expected at level 5. The coverage is good but not complete, as it misses critical leadership aspects."
                        },
                        {
                            "id": "3ba11698-47de-4064-9386-eaceac1bf7dc",
                            "category_id": "30b80c55-c404-4136-aece-c38baf90acb6",
                            "subcategory_name": "Design Thinking",
                            "weight_percentage": 35,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 75,
                            "missing_count": 2,
                            "scored_percentage": 70,
                            "notes": "The CV shows some design thinking capabilities, such as 'Translated the UI/UX design wireframes to actual code' and 'Designed and integrated web services / APIs.' However, it lacks evidence of complex implementations or mentoring others, which are expected at level 4. The coverage is moderate, with missing elements related to advanced design thinking processes and leadership in design."
                        },
                        {
                            "id": "1b50d829-c9e3-4be8-9aff-c8cd71066fc6",
                            "category_id": "30b80c55-c404-4136-aece-c38baf90acb6",
                            "subcategory_name": "Attention to Detail",
                            "weight_percentage": 25,
                            "expected_level": 4,
                            "actual_level": 4,
                            "base_score": 90,
                            "missing_count": 0,
                            "scored_percentage": 90,
                            "notes": "The CV provides strong evidence of attention to detail, such as 'Developed the non-blocking React code and fixed the console warnings before merging the code into base branch.' This indicates a high level of precision and thoroughness. The coverage is high, with no critical items missing, meeting the expected level 4."
                        }
                    ]
                },
                {
                    "id": "32b6ca2d-8b97-4190-ba60-744133a820e4",
                    "candidate_score_id": "a00bc4dd-e147-44a8-ab0b-4d043c849d67",
                    "category_name": "Values (Schwartz)",
                    "weight_percentage": 10,
                    "category_score_percentage": 77.8,
                    "category_contribution": 7.78,
                    "subcategories": [
                        {
                            "id": "c5f77f0d-c3ba-444f-bac5-fbb5279e30bd",
                            "category_id": "32b6ca2d-8b97-4190-ba60-744133a820e4",
                            "subcategory_name": "Creativity & Self-Direction",
                            "weight_percentage": 35,
                            "expected_level": 4,
                            "actual_level": 4,
                            "base_score": 90,
                            "missing_count": 1,
                            "scored_percentage": 88,
                            "notes": "The candidate demonstrates strong creativity and self-direction through their role in 'leading the design, schedule, assignments, code reviews using Agile' and 'Improving the architecture and fine tuning it by tracking emerging technologies.' This shows advanced production experience and complex implementations. However, there is limited evidence of mentoring others, which slightly impacts the coverage ratio."
                        },
                        {
                            "id": "97d93098-7d2c-46f3-b7d1-7ba3baa8cf02",
                            "category_id": "32b6ca2d-8b97-4190-ba60-744133a820e4",
                            "subcategory_name": "Achievement",
                            "weight_percentage": 25,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 75,
                            "missing_count": 2,
                            "scored_percentage": 72,
                            "notes": "The candidate shows solid working knowledge and has completed real projects independently, such as 'Developed new user facing features, Built reusable components and libraries using React JSX.' However, there is a lack of specific metrics or outcomes that demonstrate high achievement, and no evidence of mentoring others, which keeps them at an intermediate level."
                        },
                        {
                            "id": "4ad96c37-892f-4cb2-879d-f9d97301a38c",
                            "category_id": "32b6ca2d-8b97-4190-ba60-744133a820e4",
                            "subcategory_name": "Benevolence",
                            "weight_percentage": 20,
                            "expected_level": 3,
                            "actual_level": 2,
                            "base_score": 65,
                            "missing_count": 2,
                            "scored_percentage": 62,
                            "notes": "There is some evidence of teamwork and coordination, such as 'Co-Ordinated with the backend team' and 'Participated in Sprint ceremonies.' However, there is limited evidence of actions that directly reflect benevolence, such as helping others or community involvement, which keeps the level at basic."
                        },
                        {
                            "id": "0120f5f0-c163-47db-8cdf-4a14dcf13fbb",
                            "category_id": "32b6ca2d-8b97-4190-ba60-744133a820e4",
                            "subcategory_name": "Conformity",
                            "weight_percentage": 20,
                            "expected_level": 2,
                            "actual_level": 2,
                            "base_score": 85,
                            "missing_count": 1,
                            "scored_percentage": 83,
                            "notes": "The candidate meets the expected level for conformity, as evidenced by 'Translated the UI/UX design wireframes to actual code' and 'Troubleshooting the application to analyze and diagnose application outages and failures.' These actions show adherence to standards and procedures. However, there is limited evidence of strict adherence to organizational norms, which slightly affects the coverage."
                        }
                    ]
                },
                {
                    "id": "3c153365-6bff-4cb3-8902-bb5a62f9ad4e",
                    "candidate_score_id": "a00bc4dd-e147-44a8-ab0b-4d043c849d67",
                    "category_name": "Foundational Behaviors",
                    "weight_percentage": 15,
                    "category_score_percentage": 83.95,
                    "category_contribution": 12.59,
                    "subcategories": [
                        {
                            "id": "2331844e-8248-4850-83ea-95bbd84906ea",
                            "category_id": "3c153365-6bff-4cb3-8902-bb5a62f9ad4e",
                            "subcategory_name": "Collaboration",
                            "weight_percentage": 35,
                            "expected_level": 4,
                            "actual_level": 4,
                            "base_score": 90,
                            "missing_count": 1,
                            "scored_percentage": 88,
                            "notes": "The CV demonstrates strong collaboration skills through participation in Agile methodologies and Sprint ceremonies, such as Sprint planning, daily scrum, Sprint Review, and Sprint Retrospective. Evidence includes 'Co-Ordinated with the backend team' and 'Participated in Sprint ceremonies.' However, there is limited mention of mentoring or leading teams, which slightly impacts the coverage. Overall, the candidate meets the expected level with solid evidence of collaboration in recent projects."
                        },
                        {
                            "id": "1ff0d163-4d29-4dec-8681-d08dc4b0f0c0",
                            "category_id": "3c153365-6bff-4cb3-8902-bb5a62f9ad4e",
                            "subcategory_name": "Adaptability",
                            "weight_percentage": 35,
                            "expected_level": 4,
                            "actual_level": 4,
                            "base_score": 88,
                            "missing_count": 2,
                            "scored_percentage": 85,
                            "notes": "The candidate shows adaptability through their experience with various technologies and tools, such as ReactJS, Redux, and different testing/debugging tools. The CV mentions 'Improving the architecture and fine tuning it by tracking emerging technologies,' indicating adaptability to new technologies. However, there is limited evidence of adapting to different roles or environments beyond technical tools. The candidate meets the expected level but with slightly less coverage on non-technical adaptability."
                        },
                        {
                            "id": "26c92c18-137b-4626-9f46-a0e86c2b2626",
                            "category_id": "3c153365-6bff-4cb3-8902-bb5a62f9ad4e",
                            "subcategory_name": "Ownership",
                            "weight_percentage": 30,
                            "expected_level": 5,
                            "actual_level": 4,
                            "base_score": 80,
                            "missing_count": 3,
                            "scored_percentage": 78,
                            "notes": "The CV shows ownership through responsibilities like 'Translated the UI/UX design wireframes to actual code' and 'Developed new user facing features, Built reusable components.' However, there is a lack of evidence for leadership roles or taking full ownership of projects, which is expected at level 5. The candidate demonstrates a strong foundation in ownership but falls short of the expert level due to missing leadership and project ownership evidence."
                        }
                    ]
                },
                {
                    "id": "76380154-a2c1-461c-9cdf-950ab68f25ed",
                    "candidate_score_id": "a00bc4dd-e147-44a8-ab0b-4d043c849d67",
                    "category_name": "Leadership Skills",
                    "weight_percentage": 15,
                    "category_score_percentage": 66.2,
                    "category_contribution": 9.93,
                    "subcategories": [
                        {
                            "id": "0139a453-6b0f-47b4-92c0-dd643c56fb0c",
                            "category_id": "76380154-a2c1-461c-9cdf-950ab68f25ed",
                            "subcategory_name": "Mentoring & Peer Review",
                            "weight_percentage": 40,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 75,
                            "missing_count": 1,
                            "scored_percentage": 68,
                            "notes": "The CV mentions 'Extensively involved in leading the design, schedule, assignments, code reviews using Agile,' which indicates some level of mentoring and peer review. However, there is no explicit mention of mentoring others or providing peer reviews in a structured manner. The evidence suggests involvement but not at an advanced level expected for mentoring. Missing explicit mentoring experience reduces confidence in meeting the expected level."
                        },
                        {
                            "id": "d08c1a68-fc55-48e5-b3de-a4e17fcfa93a",
                            "category_id": "76380154-a2c1-461c-9cdf-950ab68f25ed",
                            "subcategory_name": "Decision Making",
                            "weight_percentage": 30,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 75,
                            "missing_count": 1,
                            "scored_percentage": 70,
                            "notes": "The CV shows some decision-making involvement, such as 'Improving the architecture and fine tuning it by tracking emerging technologies and evaluating their applicability to meet the business goals.' This indicates some decision-making capability, but it lacks evidence of complex decision-making or leadership in critical decisions. The level of decision-making appears to be more intermediate than advanced."
                        },
                        {
                            "id": "e1a5b1ea-c05b-4a5e-b485-e6b61fa01ffc",
                            "category_id": "76380154-a2c1-461c-9cdf-950ab68f25ed",
                            "subcategory_name": "Strategic Vision",
                            "weight_percentage": 30,
                            "expected_level": 3,
                            "actual_level": 2,
                            "base_score": 65,
                            "missing_count": 1,
                            "scored_percentage": 60,
                            "notes": "The CV lacks clear evidence of strategic vision. While there is mention of 'Improving the architecture and fine tuning it by tracking emerging technologies,' this is more tactical than strategic. There is no indication of long-term planning or strategic initiatives. The experience seems to be at a basic level, focusing on immediate project needs rather than broader strategic goals."
                        }
                    ]
                },
                {
                    "id": "41edd100-d4d6-4e87-9051-1852dd0a7d80",
                    "candidate_score_id": "a00bc4dd-e147-44a8-ab0b-4d043c849d67",
                    "category_name": "Education and Experience",
                    "weight_percentage": 10,
                    "category_score_percentage": 57.8,
                    "category_contribution": 5.78,
                    "subcategories": [
                        {
                            "id": "4f8e6451-a921-4cb8-bf3d-eaf8dd47dc74",
                            "category_id": "41edd100-d4d6-4e87-9051-1852dd0a7d80",
                            "subcategory_name": "Academic Qualification",
                            "weight_percentage": 40,
                            "expected_level": 2,
                            "actual_level": 1,
                            "base_score": 50,
                            "missing_count": 1,
                            "scored_percentage": 45,
                            "notes": "The CV mentions a 'Master of Business Administration' but does not specify any technical or computer science-related degree, which is typically expected for a React JS Developer role. This indicates a basic level of academic qualification in the relevant field, hence an actual level of 1. The coverage is low as it lacks a technical degree, which is a critical item for this role."
                        },
                        {
                            "id": "bf0738bf-1538-41c6-a832-0ccb43721e0b",
                            "category_id": "41edd100-d4d6-4e87-9051-1852dd0a7d80",
                            "subcategory_name": "Years of Experience",
                            "weight_percentage": 40,
                            "expected_level": 5,
                            "actual_level": 4,
                            "base_score": 85,
                            "missing_count": 0,
                            "scored_percentage": 82,
                            "notes": "The candidate has 3.6 years of experience in relevant roles, which is slightly below the expected level of 5 years. The experience is recent and relevant, with roles at Capgemini and Whitefield Motors Pvt Ltd. However, the years of experience do not fully meet the expected level, resulting in an actual level of 4. The coverage is good, but not complete for the expected level."
                        },
                        {
                            "id": "2478a0ea-9810-4da9-a35b-4bb8b73bd6b1",
                            "category_id": "41edd100-d4d6-4e87-9051-1852dd0a7d80",
                            "subcategory_name": "Certifications & Portfolio",
                            "weight_percentage": 20,
                            "expected_level": 3,
                            "actual_level": 1,
                            "base_score": 40,
                            "missing_count": 2,
                            "scored_percentage": 35,
                            "notes": "There is no mention of any certifications or portfolio in the CV, which are important for demonstrating expertise and practical experience in the field. This results in an actual level of 1. The lack of these elements significantly impacts the score, as they are critical for validating skills and experience."
                        }
                    ]
                }
            ],
            "insights": [
                {
                    "id": "4345e2db-c7f1-49ea-9ae5-962a81c58d1c",
                    "candidate_score_id": "a00bc4dd-e147-44a8-ab0b-4d043c849d67",
                    "insight_type": "STRENGTH",
                    "insight_text": "Extensive experience in React JS, including developing Single Page Applications and using React Hooks."
                },
                {
                    "id": "f97c1da4-8abe-4fc8-a205-4f6b54d68564",
                    "candidate_score_id": "a00bc4dd-e147-44a8-ab0b-4d043c849d67",
                    "insight_type": "STRENGTH",
                    "insight_text": "Proficient in responsive web design using Media Queries and Bootstrap, which is crucial for modern web applications."
                },
                {
                    "id": "3fc77d49-73ab-469f-a34e-d3992a8d353c",
                    "candidate_score_id": "a00bc4dd-e147-44a8-ab0b-4d043c849d67",
                    "insight_type": "STRENGTH",
                    "insight_text": "Strong foundational behaviors, demonstrated by a high score of 84.0%, indicating reliability and consistency in work."
                },
                {
                    "id": "1e55f088-7d77-48de-b82e-591837fc23ac",
                    "candidate_score_id": "a00bc4dd-e147-44a8-ab0b-4d043c849d67",
                    "insight_type": "STRENGTH",
                    "insight_text": "Good cognitive abilities with a score of 80.6%, suggesting strong problem-solving skills and the ability to learn and adapt quickly."
                },
                {
                    "id": "e85b3c38-ade4-4558-b9b3-eebb3be742f6",
                    "candidate_score_id": "a00bc4dd-e147-44a8-ab0b-4d043c849d67",
                    "insight_type": "GAP",
                    "insight_text": "Technical Skills score of 65.0% indicates room for improvement in advanced technical competencies required for an AI Developer role."
                },
                {
                    "id": "2a3daecd-6440-4da0-be06-5d40909402ae",
                    "candidate_score_id": "a00bc4dd-e147-44a8-ab0b-4d043c849d67",
                    "insight_type": "GAP",
                    "insight_text": "Leadership Skills score of 66.2% suggests a need for development in leading teams, which may be important for future growth in the role."
                },
                {
                    "id": "714f8d78-e739-47bb-b7f0-ae1814647e5c",
                    "candidate_score_id": "a00bc4dd-e147-44a8-ab0b-4d043c849d67",
                    "insight_type": "GAP",
                    "insight_text": "Education and Experience score of 57.8% highlights a potential gap in formal education or relevant experience specifically aligned with AI development."
                }
            ]
        },
        {
            "id": "ade2f9cc-e23f-47a0-ae2d-cdcf9c701f4c",
            "candidate_id": "1406c7f6-7c5f-4612-9da7-9b0d1bd471a2",
            "persona_id": "22e58466-5657-4bbc-9a9c-d6b8ee809057",
            "cv_id": "6f8a4c28-62e4-4b74-b7a7-1eeaec5df6bf",
            "pipeline_stage_reached": 3,
            "final_score": 69.63,
            "final_decision": "MODERATE_FIT",
            "embedding_score": 65.1,
            "lightweight_llm_score": 75,
            "detailed_llm_score": 69.63,
            "scored_at": "2025-10-23T09:53:42",
            "scoring_version": "v1.0",
            "processing_time_ms": 25173,
            "candidate_name": "B BHARATHI",
            "file_name": "BharathiB-React Js-3.6yrs-bengaluru.docx",
            "persona_name": "Senior Frontend Developer Persona",
            "role_name": "UI UX Designer",
            "score_stages": [
                {
                    "id": "9322d460-704f-48fe-bf90-a293b581f456",
                    "candidate_score_id": "ade2f9cc-e23f-47a0-ae2d-cdcf9c701f4c",
                    "stage_number": 1,
                    "method": "embedding_similarity",
                    "model": null,
                    "score": 65.1,
                    "threshold": 60,
                    "min_threshold": null,
                    "decision": "PASS_TO_STAGE2",
                    "reason": "Semantic match sufficient (65.1% ≥ 60.0%)",
                    "next_stage": "lightweight_screening",
                    "relevance_score": null,
                    "quick_assessment": null,
                    "skills_detected": null,
                    "roles_detected": null,
                    "key_matches": null,
                    "key_gaps": null
                },
                {
                    "id": "fc58b867-8736-45e7-a83f-1b0b640237d8",
                    "candidate_score_id": "ade2f9cc-e23f-47a0-ae2d-cdcf9c701f4c",
                    "stage_number": 2,
                    "method": "lightweight_llm",
                    "model": "gpt-4o-mini",
                    "score": 0,
                    "threshold": null,
                    "min_threshold": 70,
                    "decision": "PASS_TO_STAGE3",
                    "reason": "Borderline match (75% in 70-80% range)",
                    "next_stage": "detailed_scoring",
                    "relevance_score": 75,
                    "quick_assessment": "The candidate has relevant experience in React JS development and UI design, which aligns well with the technical requirements. However, there are some gaps in leadership and foundational behaviors that could affect their fit for more senior roles.",
                    "skills_detected": [
                        "React JS",
                        "JavaScript",
                        "TypeScript",
                        "HTML",
                        "CSS",
                        "SCSS",
                        "Bootstrap",
                        "DOM Layout",
                        "Agile",
                        "JIRA",
                        "Git",
                        "GitHub",
                        "UI Development",
                        "Responsive Web Design",
                        "Single Page Applications (SPA)",
                        "React Hooks",
                        "RESTful APIs",
                        "Performance Optimization",
                        "Problem Solving",
                        "Attention to Detail",
                        "Collaboration",
                        "Adaptability",
                        "Ownership"
                    ],
                    "roles_detected": [
                        "Frontend Developer",
                        "React JS Developer",
                        "UI Developer",
                        "Web Developer",
                        "Software Engineer",
                        "Full Stack Developer"
                    ],
                    "key_matches": [
                        "Strong experience in React JS and UI development",
                        "Proficient in JavaScript and TypeScript",
                        "Experience in Agile methodologies and code reviews"
                    ],
                    "key_gaps": [
                        "Limited experience in leadership skills and mentoring",
                        "No formal academic qualification in a technical field",
                        "Lack of certifications or a portfolio showcasing work"
                    ]
                },
                {
                    "id": "d7b75897-d1d5-45ee-b64d-a685f6090520",
                    "candidate_score_id": "ade2f9cc-e23f-47a0-ae2d-cdcf9c701f4c",
                    "stage_number": 3,
                    "method": "detailed_llm",
                    "model": "gpt-4o",
                    "score": 0,
                    "threshold": null,
                    "min_threshold": null,
                    "decision": "",
                    "reason": null,
                    "next_stage": null,
                    "relevance_score": null,
                    "quick_assessment": null,
                    "skills_detected": null,
                    "roles_detected": null,
                    "key_matches": null,
                    "key_gaps": null
                }
            ],
            "categories": [
                {
                    "id": "3f591ab3-c451-4d0d-84d7-6ff68e90bb4b",
                    "candidate_score_id": "ade2f9cc-e23f-47a0-ae2d-cdcf9c701f4c",
                    "category_name": "Technical Skills",
                    "weight_percentage": 35,
                    "category_score_percentage": 59.1,
                    "category_contribution": 20.68,
                    "subcategories": [
                        {
                            "id": "7952c3f1-3dda-4017-bc75-6c582b8e9029",
                            "category_id": "3f591ab3-c451-4d0d-84d7-6ff68e90bb4b",
                            "subcategory_name": "Frontend Frameworks",
                            "weight_percentage": 30,
                            "expected_level": 5,
                            "actual_level": 3,
                            "base_score": 70,
                            "missing_count": 3,
                            "scored_percentage": 52,
                            "notes": "The candidate has strong experience with React, as evidenced by multiple mentions of using React JS in projects and roles, including 'Proficient in developing Single Page Applications (SPA) using ReactJS' and 'Hands-on work experience in React JS, Hooks, React Forms, Router.' However, there is no mention of Next.js, Vue.js, or Angular, which are critical missing items. The depth in React is solid, but the breadth is lacking due to missing other frameworks. The experience is recent and relevant, but the lack of coverage in other frameworks significantly impacts the score."
                        },
                        {
                            "id": "e76b0454-b1fa-4b79-8152-4f64a9cb6c7f",
                            "category_id": "3f591ab3-c451-4d0d-84d7-6ff68e90bb4b",
                            "subcategory_name": "JavaScript & TypeScript",
                            "weight_percentage": 25,
                            "expected_level": 5,
                            "actual_level": 4,
                            "base_score": 85,
                            "missing_count": 1,
                            "scored_percentage": 78,
                            "notes": "The candidate demonstrates strong experience with JavaScript, including ES6, as seen in 'Technologies | ReactJS, Redux, Redux-Thunk, JavaScript, ES6, JSON, HTML/HTML5, CSS3, Bootstrap.' However, there is no explicit mention of TypeScript, which is a critical missing item. Node.js is not mentioned either, but the focus on JavaScript and ES6 is strong. The experience is recent and relevant, but the missing TypeScript and Node.js reduce the score."
                        },
                        {
                            "id": "ed02ea85-3acb-47d4-872c-23dbb517f596",
                            "category_id": "3f591ab3-c451-4d0d-84d7-6ff68e90bb4b",
                            "subcategory_name": "UI Development & Styling",
                            "weight_percentage": 25,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 75,
                            "missing_count": 3,
                            "scored_percentage": 60,
                            "notes": "The candidate has experience with HTML5 and CSS3, as mentioned in 'Translated the UI/UX design wireframes to actual code that will produce visual elements of the application using HTML5, CSS/SCSS, and Bootstrap 4.' However, there is no mention of Tailwind, Sass, or Styled Components. The depth in HTML5 and CSS3 is solid, but the breadth is lacking due to missing other styling tools. The experience is recent and relevant, but the lack of coverage in other styling tools significantly impacts the score."
                        },
                        {
                            "id": "1c4e84a5-092a-4de3-aa5d-a8090276d5a9",
                            "category_id": "3f591ab3-c451-4d0d-84d7-6ff68e90bb4b",
                            "subcategory_name": "Performance & Optimization",
                            "weight_percentage": 20,
                            "expected_level": 4,
                            "actual_level": 2,
                            "base_score": 60,
                            "missing_count": 3,
                            "scored_percentage": 45,
                            "notes": "The candidate mentions 'Optimized application for maximum speed and scalability using React Lazy Loading,' which covers Lazy Loading. However, there is no mention of Lighthouse, Core Web Vitals, or Code Splitting. The experience with Lazy Loading is relevant, but the lack of other performance and optimization tools significantly impacts the score. The overall depth is limited, and the coverage is poor."
                        }
                    ]
                },
                {
                    "id": "d64514d0-43d1-4d8c-ac80-3cb99206823e",
                    "candidate_score_id": "ade2f9cc-e23f-47a0-ae2d-cdcf9c701f4c",
                    "category_name": "Cognitive Demands",
                    "weight_percentage": 15,
                    "category_score_percentage": 80.85,
                    "category_contribution": 12.13,
                    "subcategories": [
                        {
                            "id": "3ce0c822-846b-460f-b908-53188db13db7",
                            "category_id": "d64514d0-43d1-4d8c-ac80-3cb99206823e",
                            "subcategory_name": "Problem Solving",
                            "weight_percentage": 40,
                            "expected_level": 5,
                            "actual_level": 4,
                            "base_score": 88,
                            "missing_count": 1,
                            "scored_percentage": 82,
                            "notes": "The CV demonstrates strong problem-solving skills through the candidate's experience in troubleshooting applications, analyzing and diagnosing application outages, and resolving conflicts. The candidate has been involved in optimizing applications for speed and scalability, which indicates a good level of problem-solving. However, there is no explicit mention of leadership in problem-solving or handling multiple advanced projects, which are expected at level 5. Evidence includes: 'Troubleshooting the application to analyze and diagnose application outages and failures, and resolving conflicts.'"
                        },
                        {
                            "id": "895715af-fa16-47d6-ae9b-6b1c8cc1b0a9",
                            "category_id": "d64514d0-43d1-4d8c-ac80-3cb99206823e",
                            "subcategory_name": "Design Thinking",
                            "weight_percentage": 35,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 78,
                            "missing_count": 2,
                            "scored_percentage": 73,
                            "notes": "The candidate has experience in translating UI/UX design wireframes to actual code and developing user-friendly applications, which shows some design thinking capability. However, there is limited evidence of complex implementations or mentoring others in design thinking, which are expected at level 4. Evidence includes: 'Translated the UI/UX design wireframes to actual code that will produce visual elements of the application using HTML5, CSS/SCSS, and Bootstrap 4.'"
                        },
                        {
                            "id": "68add23a-80d2-494f-8fe1-e8e123e2e390",
                            "category_id": "d64514d0-43d1-4d8c-ac80-3cb99206823e",
                            "subcategory_name": "Attention to Detail",
                            "weight_percentage": 25,
                            "expected_level": 4,
                            "actual_level": 4,
                            "base_score": 90,
                            "missing_count": 0,
                            "scored_percentage": 90,
                            "notes": "The CV shows strong attention to detail through the candidate's experience in optimizing applications, fixing console warnings, and ensuring non-blocking React code. The candidate's role in developing reusable components and libraries also suggests a high level of attention to detail. Evidence includes: 'Developed the non-blocking React code and fixed the console warnings before merging the code into base branch.'"
                        }
                    ]
                },
                {
                    "id": "8ebcaf40-40a8-4bc2-a1cb-963fdcf65924",
                    "candidate_score_id": "ade2f9cc-e23f-47a0-ae2d-cdcf9c701f4c",
                    "category_name": "Values (Schwartz)",
                    "weight_percentage": 10,
                    "category_score_percentage": 80.15,
                    "category_contribution": 8.02,
                    "subcategories": [
                        {
                            "id": "58a9fb91-f389-491b-b97e-40d31ae301e6",
                            "category_id": "8ebcaf40-40a8-4bc2-a1cb-963fdcf65924",
                            "subcategory_name": "Creativity & Self-Direction",
                            "weight_percentage": 35,
                            "expected_level": 4,
                            "actual_level": 4,
                            "base_score": 90,
                            "missing_count": 1,
                            "scored_percentage": 88,
                            "notes": "The CV demonstrates strong creativity and self-direction through involvement in designing UI applications and leading design schedules. Evidence includes 'Extensively involved in leading the design, schedule, assignments, code reviews using Agile' and 'Improving the architecture and fine tuning it by tracking emerging technologies.' However, the CV lacks explicit mention of self-initiated projects or innovations, which slightly reduces coverage."
                        },
                        {
                            "id": "e160a1f4-c392-4206-953f-715693989a9d",
                            "category_id": "8ebcaf40-40a8-4bc2-a1cb-963fdcf65924",
                            "subcategory_name": "Achievement",
                            "weight_percentage": 25,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 80,
                            "missing_count": 2,
                            "scored_percentage": 75,
                            "notes": "The candidate shows a solid level of achievement by working on significant projects like 'Honda Sales Application Development' and 'Health Care Management.' However, the CV lacks specific metrics or outcomes that demonstrate high achievement, such as project success rates or personal contributions leading to business improvements. This results in a lower level assessment."
                        },
                        {
                            "id": "70de3d13-d3cd-4d15-9eeb-d0e70acf3615",
                            "category_id": "8ebcaf40-40a8-4bc2-a1cb-963fdcf65924",
                            "subcategory_name": "Benevolence",
                            "weight_percentage": 20,
                            "expected_level": 3,
                            "actual_level": 2,
                            "base_score": 70,
                            "missing_count": 2,
                            "scored_percentage": 65,
                            "notes": "The CV provides limited evidence of benevolence. While the candidate has worked in team settings ('Team Members: 13' and 'Co-Ordinated with the backend team'), there is no explicit mention of mentoring, supporting colleagues, or community involvement. This results in a lower level assessment and coverage."
                        },
                        {
                            "id": "90514cb6-3b45-4db8-bfc6-0b9cf15ebf21",
                            "category_id": "8ebcaf40-40a8-4bc2-a1cb-963fdcf65924",
                            "subcategory_name": "Conformity",
                            "weight_percentage": 20,
                            "expected_level": 2,
                            "actual_level": 3,
                            "base_score": 85,
                            "missing_count": 0,
                            "scored_percentage": 88,
                            "notes": "The candidate demonstrates a good level of conformity through adherence to Agile methodologies ('Participated in Sprint ceremonies Sprint planning, daily scrum, Sprint Review and Sprint Retrospective') and following established coding practices ('Developed the non-blocking React code and fixed the console warnings before merging the code into base branch'). This exceeds the expected level for conformity."
                        }
                    ]
                },
                {
                    "id": "09a506fb-2b80-4dae-8d2a-284cd1e592bd",
                    "candidate_score_id": "ade2f9cc-e23f-47a0-ae2d-cdcf9c701f4c",
                    "category_name": "Foundational Behaviors",
                    "weight_percentage": 15,
                    "category_score_percentage": 83.95,
                    "category_contribution": 12.59,
                    "subcategories": [
                        {
                            "id": "ed44b261-1495-4cba-8c02-b72e733c455b",
                            "category_id": "09a506fb-2b80-4dae-8d2a-284cd1e592bd",
                            "subcategory_name": "Collaboration",
                            "weight_percentage": 35,
                            "expected_level": 4,
                            "actual_level": 4,
                            "base_score": 90,
                            "missing_count": 1,
                            "scored_percentage": 88,
                            "notes": "The CV demonstrates strong collaboration skills through participation in 'Sprint ceremonies Sprint planning, daily scrum, Sprint Review and Sprint Retrospective' and 'Co-Ordinated with the backend team'. The candidate has worked in teams of 13 and 16 members, indicating experience in collaborative environments. However, there is limited evidence of mentoring others or leading teams, which slightly affects the coverage ratio. Overall, the candidate meets the expected level with solid evidence of collaboration in recent projects."
                        },
                        {
                            "id": "d47a7103-9ce6-432a-a530-3ec91d63a705",
                            "category_id": "09a506fb-2b80-4dae-8d2a-284cd1e592bd",
                            "subcategory_name": "Adaptability",
                            "weight_percentage": 35,
                            "expected_level": 4,
                            "actual_level": 4,
                            "base_score": 88,
                            "missing_count": 1,
                            "scored_percentage": 85,
                            "notes": "The candidate shows adaptability through 'Improving the architecture and fine tuning it by tracking emerging technologies' and 'Troubleshooting the application to analyze and diagnose application outages and failures'. These activities demonstrate the ability to adapt to new challenges and technologies. However, there is limited evidence of adapting to different roles or environments beyond the technical scope. The experience is recent and relevant, supporting the expected level of adaptability."
                        },
                        {
                            "id": "cac893ab-aa4e-4989-a702-cf4e2467ddc6",
                            "category_id": "09a506fb-2b80-4dae-8d2a-284cd1e592bd",
                            "subcategory_name": "Ownership",
                            "weight_percentage": 30,
                            "expected_level": 5,
                            "actual_level": 4,
                            "base_score": 80,
                            "missing_count": 2,
                            "scored_percentage": 78,
                            "notes": "The candidate demonstrates ownership through responsibilities like 'Developed new user facing features, Built reusable components and libraries using React JSX' and 'Developed the non-blocking React code and fixed the console warnings before merging the code into base branch'. However, there is no explicit evidence of leading projects or taking full ownership of major deliverables, which is expected at level 5. The candidate shows strong partial ownership but lacks the depth required for an expert level."
                        }
                    ]
                },
                {
                    "id": "1efdfab1-a563-475b-ba50-a678effea4bb",
                    "candidate_score_id": "ade2f9cc-e23f-47a0-ae2d-cdcf9c701f4c",
                    "category_name": "Leadership Skills",
                    "weight_percentage": 15,
                    "category_score_percentage": 66.2,
                    "category_contribution": 9.93,
                    "subcategories": [
                        {
                            "id": "fb33c7e1-b96d-41fa-adf5-befbb802b760",
                            "category_id": "1efdfab1-a563-475b-ba50-a678effea4bb",
                            "subcategory_name": "Mentoring & Peer Review",
                            "weight_percentage": 40,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 70,
                            "missing_count": 1,
                            "scored_percentage": 68,
                            "notes": "The CV mentions 'Extensively involved in leading the design, schedule, assignments, code reviews using Agile,' which indicates some level of mentoring and peer review. However, there is no specific mention of mentoring others or providing peer reviews in a structured manner. The evidence suggests involvement in leadership activities but lacks depth in mentoring. The coverage is limited as it does not explicitly cover mentoring activities, leading to a lower score."
                        },
                        {
                            "id": "66d4a696-1338-46f4-83a5-f3d36063ed4f",
                            "category_id": "1efdfab1-a563-475b-ba50-a678effea4bb",
                            "subcategory_name": "Decision Making",
                            "weight_percentage": 30,
                            "expected_level": 4,
                            "actual_level": 3,
                            "base_score": 75,
                            "missing_count": 1,
                            "scored_percentage": 72,
                            "notes": "The CV shows involvement in decision-making processes, such as 'Improving the architecture and fine tuning it by tracking emerging technologies and evaluating their applicability to meet the business goals.' This indicates some decision-making capabilities. However, there is no explicit mention of leading decision-making processes or making strategic decisions independently. The evidence is moderate, with some coverage but lacking depth in complex decision-making scenarios."
                        },
                        {
                            "id": "dc8d1851-465a-4340-b914-9c5bb363d019",
                            "category_id": "1efdfab1-a563-475b-ba50-a678effea4bb",
                            "subcategory_name": "Strategic Vision",
                            "weight_percentage": 30,
                            "expected_level": 3,
                            "actual_level": 2,
                            "base_score": 60,
                            "missing_count": 1,
                            "scored_percentage": 58,
                            "notes": "The CV lacks explicit evidence of strategic vision. While there is mention of 'Improving the architecture and fine tuning it by tracking emerging technologies,' this does not fully demonstrate a strategic vision. The experience appears to be more focused on implementation rather than strategic planning or vision. The coverage is limited, and the evidence does not meet the expected level for strategic vision."
                        }
                    ]
                },
                {
                    "id": "a247b86a-b3ae-4509-a6b9-ee7e69fd772d",
                    "candidate_score_id": "ade2f9cc-e23f-47a0-ae2d-cdcf9c701f4c",
                    "category_name": "Education and Experience",
                    "weight_percentage": 10,
                    "category_score_percentage": 62.8,
                    "category_contribution": 6.28,
                    "subcategories": [
                        {
                            "id": "12f72994-bd2c-4f65-9627-fd85223e2c5a",
                            "category_id": "a247b86a-b3ae-4509-a6b9-ee7e69fd772d",
                            "subcategory_name": "Academic Qualification",
                            "weight_percentage": 40,
                            "expected_level": 2,
                            "actual_level": 2,
                            "base_score": 85,
                            "missing_count": 1,
                            "scored_percentage": 72,
                            "notes": "The CV mentions a 'Master of Business Administration' which meets the expected level of basic academic qualification. However, there is no mention of any technical or computer science-related degree which would be more relevant for a React JS Developer role. This results in a lower coverage ratio and a penalty for missing a critical item."
                        },
                        {
                            "id": "40338993-ae33-4c6f-9898-d801d73f086d",
                            "category_id": "a247b86a-b3ae-4509-a6b9-ee7e69fd772d",
                            "subcategory_name": "Years of Experience",
                            "weight_percentage": 40,
                            "expected_level": 5,
                            "actual_level": 3,
                            "base_score": 70,
                            "missing_count": 2,
                            "scored_percentage": 65,
                            "notes": "The candidate has 3.6 years of experience, which is below the expected level of 5 years. The experience is recent and relevant, focusing on React JS development. However, the depth is more intermediate as the candidate has not demonstrated leadership or advanced project management, which is expected at level 5. The coverage ratio reflects the gap in years and depth."
                        },
                        {
                            "id": "7ea4a67f-5dcb-48b9-9b24-ec47286601ce",
                            "category_id": "a247b86a-b3ae-4509-a6b9-ee7e69fd772d",
                            "subcategory_name": "Certifications & Portfolio",
                            "weight_percentage": 20,
                            "expected_level": 3,
                            "actual_level": 1,
                            "base_score": 50,
                            "missing_count": 2,
                            "scored_percentage": 40,
                            "notes": "There is no mention of any certifications or a portfolio in the CV. This is a significant gap as certifications can demonstrate a commitment to professional development and validate skills. The lack of evidence results in a low score for this subcategory."
                        }
                    ]
                }
            ],
            "insights": [
                {
                    "id": "7e02ed52-c8c0-4e83-b1fe-ccbb039b7b1a",
                    "candidate_score_id": "ade2f9cc-e23f-47a0-ae2d-cdcf9c701f4c",
                    "insight_type": "STRENGTH",
                    "insight_text": "Strong experience in React JS development, including creating interactive UIs and single-page applications, as demonstrated by the current role at Capgemini."
                },
                {
                    "id": "fd7835e3-4984-4b87-89b6-718e921e04b0",
                    "candidate_score_id": "ade2f9cc-e23f-47a0-ae2d-cdcf9c701f4c",
                    "insight_type": "STRENGTH",
                    "insight_text": "Proficient in using modern React features such as hooks and Redux, which are essential for efficient state management in complex applications."
                },
                {
                    "id": "f6bfd1da-fd0e-4e4b-89e1-9cc3d148e99b",
                    "candidate_score_id": "ade2f9cc-e23f-47a0-ae2d-cdcf9c701f4c",
                    "insight_type": "STRENGTH",
                    "insight_text": "Solid understanding of responsive web design using Media Queries and Bootstrap, ensuring applications are accessible across various devices."
                },
                {
                    "id": "f7344bb1-2de6-4a0c-a4a1-119a8897b8f6",
                    "candidate_score_id": "ade2f9cc-e23f-47a0-ae2d-cdcf9c701f4c",
                    "insight_type": "STRENGTH",
                    "insight_text": "Experience in integrating RESTful services and optimizing applications for speed and scalability, which are crucial for high-performance web applications."
                },
                {
                    "id": "fc97807f-749d-495e-9532-81baedc1756f",
                    "candidate_score_id": "ade2f9cc-e23f-47a0-ae2d-cdcf9c701f4c",
                    "insight_type": "GAP",
                    "insight_text": "Technical skills score is relatively low at 59.1%, indicating potential gaps in advanced technical competencies or breadth of technology stack knowledge required for a senior role."
                },
                {
                    "id": "bfdd9b08-4dc2-4a21-91f1-f91d0f8af4be",
                    "candidate_score_id": "ade2f9cc-e23f-47a0-ae2d-cdcf9c701f4c",
                    "insight_type": "GAP",
                    "insight_text": "Leadership skills are moderate at 66.2%, suggesting limited experience in leading teams or projects, which is often expected in a senior developer role."
                },
                {
                    "id": "f3fd426f-0f1f-4f58-8dd6-8aa32266b46a",
                    "candidate_score_id": "ade2f9cc-e23f-47a0-ae2d-cdcf9c701f4c",
                    "insight_type": "GAP",
                    "insight_text": "Education and experience score of 62.8% may reflect a need for further formal education or more diverse experience in different environments or industries."
                }
            ]
        }
    ],
    "total": 4,
    "page": 1,
    "size": 10,
    "has_next": false,
    "has_prev": false
}

export const scoreWithAi = {
    "score_id": "f864dedb-3a1a-424f-9b54-65be67f13b23",
    "candidate_id": "1406c7f6-7c5f-4612-9da7-9b0d1bd471a2",
    "persona_id": "b52876f0-4e4c-484b-8937-35653c626c21",
    "final_score": 68.78,
    "final_decision": "MODERATE_FIT",
    "pipeline_stage_reached": 3,
    "candidate_name": "B BHARATHI",
    "file_name": "BharathiB-React Js-3.6yrs-bengaluru.docx",
    "persona_name": "ai-developer-AD-role",
    "role_name": "AI Developer"
}