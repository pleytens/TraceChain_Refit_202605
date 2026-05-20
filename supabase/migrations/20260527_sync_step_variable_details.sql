-- Sync variable_details on process steps from action's required_variable_categories
-- For steps where ALL variable_details flags are false but the action has some set,
-- update the step's variable_details to match the action's required_variable_categories.
UPDATE tc_process_action_steps pas
SET variable_details = (
  SELECT al.required_variable_categories
  FROM tc_action_library al
  WHERE al.id = pas.action_id
    AND al.required_variable_categories IS NOT NULL
    AND (
      (al.required_variable_categories->>'who')::boolean IS TRUE OR
      (al.required_variable_categories->>'when')::boolean IS TRUE OR
      (al.required_variable_categories->>'what')::boolean IS TRUE OR
      (al.required_variable_categories->>'where')::boolean IS TRUE
    )
  LIMIT 1
)
WHERE (
  (pas.variable_details->>'who')::boolean IS NOT TRUE AND
  (pas.variable_details->>'when')::boolean IS NOT TRUE AND
  (pas.variable_details->>'what')::boolean IS NOT TRUE AND
  (pas.variable_details->>'where')::boolean IS NOT TRUE
)
AND EXISTS (
  SELECT 1 FROM tc_action_library al
  WHERE al.id = pas.action_id
    AND al.required_variable_categories IS NOT NULL
    AND (
      (al.required_variable_categories->>'who')::boolean IS TRUE OR
      (al.required_variable_categories->>'when')::boolean IS TRUE OR
      (al.required_variable_categories->>'what')::boolean IS TRUE OR
      (al.required_variable_categories->>'where')::boolean IS TRUE
    )
);
