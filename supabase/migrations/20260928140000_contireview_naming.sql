-- Name the suggested-outcomes review step ContiReview.
-- Operators stay the confirmed people. intake_reviewer remains the stored seat key.

update public.rfi_roster
set notes = 'Acts in ContiReview.'
where role = 'intake_reviewer'
  and notes in ('Intake reviewer.', '');

update public.rfi_items
set doc_review_notes = 'ContiRFI stays the draft and document-review process. Suggested outcomes are the ContiReview form in ContiHub. Paste citations from the Teams file set. Quote the printed sheet label and the words on the sheet. Hub does not invent an answer or a sheet number. If the documents already answer the question, close it with the drafter and do not issue.'
where number = 'RFI-P01'
  and doc_review_notes like '%suggested-outcomes form is ContiHub%';
