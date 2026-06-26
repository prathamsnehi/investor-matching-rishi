Prath:

- schema design (initial) -> investor, founder, pitch basic skeletal structure
- pitch deck upload interface with firebase
- give parv's backend worker the link to the pitch deck within the firebase bucket
- implement login auth flow screen
- in profile, add thigns like ability to change fields, change password, sign out

parv: 
 - sparse embedding implementation
 - For preprocessing pipeline: 
    1. Cap chunks per document 
    2. deduplication of near identical chunks
    3. Ignore low value chunks, use minimum similarity threshold
 - build inference pipeline
 - add all helpers for inference
 - replace math with numpy
 - upload chunking and validation
