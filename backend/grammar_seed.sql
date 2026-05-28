SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM grammar_section_attempts;
DELETE FROM grammar_questions;
DELETE FROM grammar_sections;
ALTER TABLE grammar_sections AUTO_INCREMENT = 1;
ALTER TABLE grammar_questions AUTO_INCREMENT = 1;
ALTER TABLE grammar_section_attempts AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- UPDATE EXISTING LESSONS 1-8
-- ============================================================
UPDATE grammar_lessons SET content='<h2>Simple Present Tense</h2><p>Use the Simple Present for <strong>habits</strong>, <strong>routines</strong>, <strong>facts</strong>, and <strong>general truths</strong>.</p><h3>Affirmative</h3><table><tr><th>Subject</th><th>Verb Form</th><th>Example</th></tr><tr><td>I / You / We / They</td><td>base verb</td><td>I <strong>work</strong> here.</td></tr><tr><td>He / She / It</td><td>verb + s/es</td><td>She <strong>works</strong> here.</td></tr></table><h3>Negative: <code>do/does + not + base verb</code></h3><blockquote>I do not like coffee. &nbsp; She does not play football.</blockquote><h3>Question: <code>Do/Does + subject + base verb?</code></h3><blockquote>Do you speak English? &nbsp; Does he live here?</blockquote><h3>Spelling Rules for He/She/It</h3><table><tr><th>Rule</th><th>Example</th></tr><tr><td>Most verbs → + s</td><td>work → works</td></tr><tr><td>-s/-x/-z/-ch/-sh → + es</td><td>watch → watches</td></tr><tr><td>Consonant + y → ies</td><td>study → studies</td></tr><tr><td>have → has</td><td>He has a car.</td></tr></table><h3>Signal Words</h3><p>always · usually · often · sometimes · rarely · never · every day · on Mondays</p>' WHERE id=1;
UPDATE grammar_lessons SET content='<h2>Present Continuous Tense</h2><p>Use the Present Continuous for actions <strong>happening right now</strong> or around the present time.</p><h3>Structure: <code>am / is / are + verb-ing</code></h3><table><tr><th>Subject</th><th>Auxiliary</th><th>Example</th></tr><tr><td>I</td><td>am</td><td>I <strong>am working</strong> now.</td></tr><tr><td>He / She / It</td><td>is</td><td>She <strong>is sleeping</strong>.</td></tr><tr><td>You / We / They</td><td>are</td><td>They <strong>are playing</strong>.</td></tr></table><h3>Negative: <code>am/is/are + not + verb-ing</code></h3><blockquote>I am not working. &nbsp; She is not sleeping. &nbsp; They are not playing.</blockquote><h3>Question: <code>Am/Is/Are + subject + verb-ing?</code></h3><blockquote>Are you listening? &nbsp; Is she coming?</blockquote><h3>Spelling Rules for -ing</h3><table><tr><th>Rule</th><th>Example</th></tr><tr><td>Most verbs → + ing</td><td>work → working</td></tr><tr><td>End in -e → drop e + ing</td><td>make → making</td></tr><tr><td>Short vowel + consonant → double + ing</td><td>run → running</td></tr></table><h3>Stative Verbs (NOT used with -ing)</h3><p>know · believe · want · need · like · love · hate · understand · seem</p><h3>Signal Words</h3><p>now · right now · at the moment · currently · Look! · Listen!</p>' WHERE id=2;
UPDATE grammar_lessons SET content='<h2>Simple Past Tense</h2><p>Use the Simple Past for <strong>completed actions</strong> at a specific time in the past.</p><h3>Regular Verbs: verb + ed</h3><table><tr><th>Rule</th><th>Example</th></tr><tr><td>Most → + ed</td><td>work → worked</td></tr><tr><td>End in -e → + d</td><td>live → lived</td></tr><tr><td>Consonant + y → ied</td><td>study → studied</td></tr><tr><td>Short vowel + consonant → double + ed</td><td>stop → stopped</td></tr></table><h3>Common Irregular Verbs</h3><table><tr><th>Base</th><th>Past</th><th>Base</th><th>Past</th></tr><tr><td>go</td><td>went</td><td>have</td><td>had</td></tr><tr><td>come</td><td>came</td><td>make</td><td>made</td></tr><tr><td>see</td><td>saw</td><td>get</td><td>got</td></tr><tr><td>take</td><td>took</td><td>give</td><td>gave</td></tr><tr><td>buy</td><td>bought</td><td>eat</td><td>ate</td></tr></table><h3>Negative: <code>did + not + base verb</code></h3><blockquote>I did not go. &nbsp; She did not eat breakfast.</blockquote><h3>Question: <code>Did + subject + base verb?</code></h3><blockquote>Did you watch TV? &nbsp; Did he call you?</blockquote><h3>Signal Words</h3><p>yesterday · last night/week/year · ago · in 2020 · when I was young</p>' WHERE id=3;
UPDATE grammar_lessons SET content='<h2>Simple Future Tense</h2><p>English has two main ways to express the future: <strong>will</strong> and <strong>be going to</strong>.</p><h3>Will + base verb</h3><table><tr><th>Use</th><th>Example</th></tr><tr><td>Predictions (no evidence)</td><td>I think it <strong>will rain</strong> tomorrow.</td></tr><tr><td>Spontaneous decisions</td><td>I <strong>will get</strong> the door.</td></tr><tr><td>Promises / offers</td><td>I <strong>will help</strong> you.</td></tr></table><h3>Be going to + base verb</h3><table><tr><th>Use</th><th>Example</th></tr><tr><td>Plans / intentions</td><td>I <strong>am going to visit</strong> Paris.</td></tr><tr><td>Predictions with evidence</td><td>Look! It <strong>is going to rain</strong>!</td></tr></table><h3>Negative</h3><blockquote>I will not (won\'t) come. &nbsp; She is not going to study.</blockquote><h3>Question</h3><blockquote>Will you help me? &nbsp; Are you going to travel?</blockquote><h3>Signal Words</h3><p>tomorrow · next week/month/year · soon · in the future · later</p>' WHERE id=4;
UPDATE grammar_lessons SET content='<h2>First Conditional</h2><p>Expresses <strong>real and possible</strong> situations in the present or future.</p><h3>Structure</h3><table><tr><th>If Clause</th><th>Main Clause</th></tr><tr><td>If + Present Simple</td><td>will + base verb</td></tr></table><blockquote>If it rains, I will stay at home.<br>If you study hard, you will pass the exam.</blockquote><h3>Important Notes</h3><ul><li>The if-clause can come first or second.</li><li>Do NOT use will in the if-clause.</li><li>Other modals: can, might, should in the main clause.</li></ul><h3>Other Modals in Main Clause</h3><table><tr><th>Modal</th><th>Example</th></tr><tr><td>can</td><td>If you come early, you <strong>can</strong> help us.</td></tr><tr><td>might</td><td>If she calls, I <strong>might</strong> answer.</td></tr><tr><td>should</td><td>If he is late, we <strong>should</strong> start without him.</td></tr></table>' WHERE id=5;
UPDATE grammar_lessons SET content='<h2>Second Conditional</h2><p>Expresses <strong>hypothetical, unlikely, or imaginary</strong> situations in the present or future.</p><h3>Structure</h3><table><tr><th>If Clause</th><th>Main Clause</th></tr><tr><td>If + Past Simple</td><td>would + base verb</td></tr></table><blockquote>If I had more money, I would travel the world.<br>If she were taller, she would be a model.</blockquote><h3>Important Notes</h3><ul><li>Use <code>were</code> (not was) with all subjects in formal writing.</li><li>The situation is NOT real — imaginary or very unlikely.</li></ul><h3>First vs Second Conditional</h3><table><tr><th>First (possible)</th><th>Second (hypothetical)</th></tr><tr><td>If I have time, I will come.</td><td>If I had time, I would come.</td></tr></table>' WHERE id=6;
UPDATE grammar_lessons SET content='<h2>Passive Voice</h2><p>Use the Passive when the <strong>action</strong> is more important than who performs it, or when the doer is unknown.</p><h3>Structure: <code>be + past participle</code></h3><table><tr><th>Tense</th><th>Active</th><th>Passive</th></tr><tr><td>Present Simple</td><td>She cleans the room.</td><td>The room <strong>is cleaned</strong>.</td></tr><tr><td>Past Simple</td><td>They built this bridge.</td><td>This bridge <strong>was built</strong>.</td></tr><tr><td>Present Perfect</td><td>He has written the report.</td><td>The report <strong>has been written</strong>.</td></tr><tr><td>Future (will)</td><td>They will finish the project.</td><td>The project <strong>will be finished</strong>.</td></tr><tr><td>Modal</td><td>You must sign the form.</td><td>The form <strong>must be signed</strong>.</td></tr></table><h3>How to Transform Active to Passive</h3><ol><li>Object of active → subject of passive.</li><li>Correct form of <code>be</code> for the tense.</li><li>Main verb → past participle.</li><li>Add <code>by + agent</code> if needed.</li></ol><blockquote>Active: Tom wrote the letter.<br>Passive: The letter was written by Tom.</blockquote>' WHERE id=7;
UPDATE grammar_lessons SET content='<h2>Relative Clauses</h2><p>A <strong>relative clause</strong> gives more information about a noun using a <em>relative pronoun</em>.</p><h3>Relative Pronouns</h3><table><tr><th>Pronoun</th><th>Refers to</th><th>Example</th></tr><tr><td>who</td><td>people</td><td>The man <strong>who called</strong> is my uncle.</td></tr><tr><td>which</td><td>things/animals</td><td>The book <strong>which I bought</strong> is great.</td></tr><tr><td>that</td><td>people or things</td><td>The car <strong>that she drives</strong> is red.</td></tr><tr><td>whose</td><td>possession</td><td>The student <strong>whose phone</strong> rang left.</td></tr><tr><td>where</td><td>places</td><td>The city <strong>where I was born</strong> is Hanoi.</td></tr><tr><td>when</td><td>time</td><td>I remember the day <strong>when we met</strong>.</td></tr></table><h3>Defining vs Non-defining</h3><table><tr><th>Type</th><th>Commas?</th><th>Example</th></tr><tr><td>Defining (essential)</td><td>No commas</td><td>The woman <strong>who lives next door</strong> is friendly.</td></tr><tr><td>Non-defining (extra info)</td><td>With commas</td><td>My sister, <strong>who lives in Paris</strong>, is visiting.</td></tr></table><p><code>that</code> — defining clauses only. <code>which</code> — both types.</p>' WHERE id=8;

-- ============================================================
-- NEW LESSONS 9-12
-- ============================================================
INSERT INTO grammar_lessons (title,content,level,order_index,created_by) VALUES
('Present Perfect Tense','<h2>Present Perfect Tense</h2><p>Connects the <strong>past with the present</strong>.</p><h3>Structure: <code>have / has + past participle</code></h3><table><tr><th>Subject</th><th>Form</th><th>Example</th></tr><tr><td>I / You / We / They</td><td>have + p.p.</td><td>I <strong>have visited</strong> Paris.</td></tr><tr><td>He / She / It</td><td>has + p.p.</td><td>She <strong>has finished</strong> her work.</td></tr></table><h3>Uses</h3><table><tr><th>Use</th><th>Example</th></tr><tr><td>Experience (ever/never)</td><td>Have you ever eaten sushi?</td></tr><tr><td>Recent action with present result</td><td>I have lost my keys. (I cannot find them now)</td></tr><tr><td>Action continuing to now</td><td>She has lived here for 5 years.</td></tr><tr><td>With just / already / yet</td><td>He has just arrived.</td></tr></table><h3>For vs Since</h3><table><tr><th>For (duration)</th><th>Since (starting point)</th></tr><tr><td>for 2 hours, for a week</td><td>since 9am, since 2020</td></tr></table><h3>Signal Words</h3><p>ever · never · already · yet · just · recently · for · since</p>','intermediate',9,1);
SET @L9=LAST_INSERT_ID();
INSERT INTO grammar_lessons (title,content,level,order_index,created_by) VALUES
('Articles: A, An, The','<h2>Articles: A, An, The</h2><p>Articles indicate whether a noun is <strong>specific</strong> or <strong>general</strong>.</p><h3>Indefinite Articles: A / An</h3><table><tr><th>Article</th><th>Use</th><th>Example</th></tr><tr><td>a</td><td>Before consonant sounds</td><td>a book, a university</td></tr><tr><td>an</td><td>Before vowel sounds</td><td>an apple, an hour</td></tr></table><p>Based on <em>sound</em>, not letter: <code>a university</code> (/j/ sound), <code>an hour</code> (silent h).</p><h3>Definite Article: The</h3><table><tr><th>Use</th><th>Example</th></tr><tr><td>Specific / already mentioned</td><td>I saw a dog. The dog was big.</td></tr><tr><td>Unique things</td><td>The sun, the moon</td></tr><tr><td>Superlatives</td><td>The best, the tallest</td></tr><tr><td>Oceans, rivers, mountain ranges</td><td>The Pacific, the Nile</td></tr></table><h3>No Article (Zero Article)</h3><table><tr><th>Use</th><th>Example</th></tr><tr><td>General plural/uncountable nouns</td><td>Dogs are loyal. Water is essential.</td></tr><tr><td>Names of countries, cities, people</td><td>Vietnam, Hanoi, Tom</td></tr><tr><td>Languages, sports, meals</td><td>I speak English. We play football.</td></tr></table>','beginner',10,1);
SET @L10=LAST_INSERT_ID();
INSERT INTO grammar_lessons (title,content,level,order_index,created_by) VALUES
('Reported Speech','<h2>Reported Speech (Indirect Speech)</h2><p>Tell what someone said <strong>without quoting exact words</strong>.</p><h3>Tense Backshift</h3><table><tr><th>Direct Speech</th><th>Reported Speech</th></tr><tr><td>Present Simple</td><td>→ Past Simple</td></tr><tr><td>Present Continuous</td><td>→ Past Continuous</td></tr><tr><td>Past Simple</td><td>→ Past Perfect</td></tr><tr><td>will</td><td>→ would</td></tr><tr><td>can</td><td>→ could</td></tr></table><blockquote>Direct: "I am tired." → She said she <strong>was</strong> tired.<br>Direct: "I will come." → He said he <strong>would</strong> come.</blockquote><h3>Say vs Tell</h3><table><tr><th>Verb</th><th>Pattern</th><th>Example</th></tr><tr><td>say</td><td>say + (that)</td><td>She <strong>said (that)</strong> she was tired.</td></tr><tr><td>tell</td><td>tell + person + (that)</td><td>She <strong>told me</strong> she was tired.</td></tr></table><h3>Reporting Questions</h3><blockquote>Direct: "Where do you live?" → He asked where I <strong>lived</strong>.<br>Direct: "Do you like tea?" → She asked <strong>if</strong> I liked tea.</blockquote>','advanced',11,1);
SET @L11=LAST_INSERT_ID();
INSERT INTO grammar_lessons (title,content,level,order_index,created_by) VALUES
('Comparatives & Superlatives','<h2>Comparatives & Superlatives</h2><p>Comparatives compare <strong>two things</strong>. Superlatives describe the <strong>extreme</strong> in a group.</p><h3>Forming Comparatives</h3><table><tr><th>Adjective</th><th>Comparative</th><th>Rule</th></tr><tr><td>tall</td><td>taller</td><td>1 syllable → + er</td></tr><tr><td>big</td><td>bigger</td><td>CVC → double + er</td></tr><tr><td>happy</td><td>happier</td><td>Consonant + y → ier</td></tr><tr><td>beautiful</td><td>more beautiful</td><td>3+ syllables → more + adj</td></tr><tr><td>good</td><td>better</td><td>Irregular</td></tr><tr><td>bad</td><td>worse</td><td>Irregular</td></tr></table><h3>Forming Superlatives</h3><table><tr><th>Adjective</th><th>Superlative</th></tr><tr><td>tall</td><td>the tallest</td></tr><tr><td>big</td><td>the biggest</td></tr><tr><td>happy</td><td>the happiest</td></tr><tr><td>beautiful</td><td>the most beautiful</td></tr><tr><td>good</td><td>the best</td></tr><tr><td>bad</td><td>the worst</td></tr></table><h3>Patterns</h3><blockquote>A is <strong>taller than</strong> B. &nbsp; A is <strong>the tallest</strong> in the group. &nbsp; A is <strong>as tall as</strong> B.</blockquote>','intermediate',12,1);
SET @L12=LAST_INSERT_ID();

-- ============================================================
-- SECTIONS
-- ============================================================
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (1,'Affirmative Sentences','Practice forming positive sentences with the correct verb form.',1);
SET @L1S1=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (1,'Negative & Questions','Form negative sentences and yes/no questions.',2);
SET @L1S2=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (1,'Mixed Practice','Combined exercises testing your overall understanding.',3);
SET @L1S3=LAST_INSERT_ID();

INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (2,'Forming -ing Verbs','Practice the spelling rules for adding -ing to verbs.',1);
SET @L2S1=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (2,'Affirmative & Negative','Use am/is/are correctly in positive and negative sentences.',2);
SET @L2S2=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (2,'Questions & Context','Form questions and identify correct usage contexts.',3);
SET @L2S3=LAST_INSERT_ID();

INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (3,'Regular Verbs Past Form','Practice -ed spelling rules for regular verbs.',1);
SET @L3S1=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (3,'Irregular Verbs','Test your knowledge of common irregular past forms.',2);
SET @L3S2=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (3,'Negative & Questions','Form negatives and questions using did.',3);
SET @L3S3=LAST_INSERT_ID();

INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (4,'Using Will','Practice will for predictions, offers and promises.',1);
SET @L4S1=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (4,'Will vs Going To','Choose the correct future form for each context.',2);
SET @L4S2=LAST_INSERT_ID();

INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (5,'Forming First Conditionals','Build correct if + will sentences.',1);
SET @L5S1=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (5,'Real Situations','Apply the first conditional to realistic scenarios.',2);
SET @L5S2=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (5,'Mixed Conditional Practice','Exercises with various modals in the main clause.',3);
SET @L5S3=LAST_INSERT_ID();

INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (6,'Hypothetical Situations','Form sentences about imaginary present/future situations.',1);
SET @L6S1=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (6,'First vs Second Conditional','Choose between real and hypothetical conditionals.',2);
SET @L6S2=LAST_INSERT_ID();

INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (7,'Present & Past Simple Passive','Form passive sentences in present and past simple.',1);
SET @L7S1=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (7,'Active to Passive Transformation','Transform active sentences into the passive voice.',2);
SET @L7S2=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (7,'Advanced Passive Forms','Passive with modals, perfect and continuous tenses.',3);
SET @L7S3=LAST_INSERT_ID();

INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (8,'Who, Which, That','Choose the correct relative pronoun for people and things.',1);
SET @L8S1=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (8,'Where, When, Whose','Practice relative adverbs and possession.',2);
SET @L8S2=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (8,'Defining vs Non-defining','Identify and form both types of relative clause.',3);
SET @L8S3=LAST_INSERT_ID();

INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (@L9,'Forming Present Perfect','Use have/has + past participle correctly.',1);
SET @L9S1=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (@L9,'For, Since, Already, Yet, Just','Master the key signal words of the Present Perfect.',2);
SET @L9S2=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (@L9,'Present Perfect vs Past Simple','Choose the correct tense for each context.',3);
SET @L9S3=LAST_INSERT_ID();

INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (@L10,'A vs An','Choose the correct indefinite article based on sound.',1);
SET @L10S1=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (@L10,'The or No Article','Decide when to use the definite article or no article.',2);
SET @L10S2=LAST_INSERT_ID();

INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (@L11,'Reporting Statements','Change direct statements into reported speech.',1);
SET @L11S1=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (@L11,'Reporting Questions','Change direct questions into reported questions.',2);
SET @L11S2=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (@L11,'Say vs Tell & Tense Changes','Master tense backshift and the say/tell distinction.',3);
SET @L11S3=LAST_INSERT_ID();

INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (@L12,'Comparatives','Form and use comparative adjectives.',1);
SET @L12S1=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (@L12,'Superlatives','Form and use superlative adjectives.',2);
SET @L12S2=LAST_INSERT_ID();
INSERT INTO grammar_sections (lesson_id,title,description,order_index) VALUES (@L12,'As...As & Mixed Practice','Use equal comparisons and choose the right form.',3);
SET @L12S3=LAST_INSERT_ID();

-- ============================================================
-- QUESTIONS  (MC uses correct=A/B/C/D; fill_blank uses fill_answer)
-- ============================================================

-- L1S1: Simple Present – Affirmative
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(1,@L1S1,'multiple_choice','She ___ to school every day.','go','goes','going','gone','B','He/She/It: add -s → goes.',1),
(1,@L1S1,'multiple_choice','They ___ football on weekends.','plays','playing','play','played','C','They (plural) uses the base verb: play.',2),
(1,@L1S1,'multiple_choice','My brother ___ the guitar every evening.','play','plays','playing','played','B','My brother = He → plays.',3),
(1,@L1S1,'multiple_choice','Water ___ at 100°C.','boil','boiling','boiled','boils','D','Scientific fact, it (water) → boils.',4),
(1,@L1S1,'multiple_choice','The cat ___ on the sofa all day.','sleep','slept','sleeping','sleeps','D','The cat = it → sleeps.',5),
(1,@L1S1,'multiple_choice','He ___ three languages fluently.','speak','speaking','spoke','speaks','D','He → speaks.',6);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(1,@L1S1,'fill_blank','She _____ (study) for two hours every night.','studies','study: consonant+y → ies.',7);

-- L1S2: Simple Present – Negative & Questions
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(1,@L1S2,'multiple_choice','She ___ like spicy food.','do not','not','does not','is not','C','She uses "does not" for negation.',1),
(1,@L1S2,'multiple_choice','___ you speak English?','Are','Do','Does','Is','B','For I/You/We/They → Do.',2),
(1,@L1S2,'multiple_choice','___ your sister work here?','Do','Are','Is','Does','D','Your sister = She → Does.',3),
(1,@L1S2,'multiple_choice','They ___ eat meat — they are vegetarians.','doesn\'t','aren\'t','don\'t','isn\'t','C','They → don\'t.',4),
(1,@L1S2,'multiple_choice','___ he read the newspaper every morning?','Do','Is','Are','Does','D','He → Does.',5),
(1,@L1S2,'multiple_choice','Which sentence is grammatically correct?','She don\'t have a car.','She doesn\'t has a car.','She doesn\'t have a car.','She not have a car.','C','does not + base verb (have, not has).',6);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(1,@L1S2,'fill_blank','_____ Tom and Lisa live in the same city? (question)','Do','Tom and Lisa = They → Do.',7);

-- L1S3: Simple Present – Mixed
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(1,@L1S3,'multiple_choice','Tom usually ___ up at 6 a.m.','wake','woke','waking','wakes','D','Tom = He → wakes.',1),
(1,@L1S3,'multiple_choice','___ it often ___ in London?','Does / rain','Do / rain','Is / rain','Does / rains','A','It → Does + base verb (rain).',2),
(1,@L1S3,'multiple_choice','My parents ___ live near my house.','doesn\'t','aren\'t','don\'t','isn\'t','C','My parents = They → don\'t.',3),
(1,@L1S3,'multiple_choice','The Earth ___ around the Sun.','move','moving','moved','moves','D','Scientific fact, The Earth = it → moves.',4);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(1,@L1S3,'fill_blank','He _____ (not/watch) TV after midnight.','doesn\'t watch','He → does not (doesn\'t) + base verb.',5),
(1,@L1S3,'fill_blank','She always _____ (carry) an umbrella.','carries','carry: consonant+y → ies.',6);

-- L2S1: Present Continuous – Forming -ing
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(2,@L2S1,'multiple_choice','What is the -ing form of "make"?','makeing','macking','making','makking','C','Drop the -e: make → making.',1),
(2,@L2S1,'multiple_choice','What is the -ing form of "run"?','runing','running','runeing','runned','B','Short vowel + consonant: double the n → running.',2),
(2,@L2S1,'multiple_choice','What is the -ing form of "sit"?','siting','sitting','siteing','sitten','B','Short vowel + consonant: double the t → sitting.',3),
(2,@L2S1,'multiple_choice','What is the -ing form of "write"?','writeing','writting','writing','writng','C','Drop the -e: write → writing.',4),
(2,@L2S1,'multiple_choice','What is the -ing form of "swim"?','swiming','swimm','swimming','swimeing','C','Short vowel + consonant: double the m → swimming.',5);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(2,@L2S1,'fill_blank','What is the -ing form of "dance"?','dancing','Drop the -e: dance → dancing.',6),
(2,@L2S1,'fill_blank','What is the -ing form of "get"?','getting','Short vowel + consonant: double the t → getting.',7);

-- L2S2: Present Continuous – Affirmative & Negative
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(2,@L2S2,'multiple_choice','She ___ a book right now.','read','reads','is reading','are reading','C','She → is + verb-ing.',1),
(2,@L2S2,'multiple_choice','We ___ dinner at the moment.','are having','is having','have','has','A','We → are + verb-ing.',2),
(2,@L2S2,'multiple_choice','He ___ right now — he is at the gym.','isn\'t sleeping','aren\'t sleeping','doesn\'t sleeping','not sleeping','A','He → is not (isn\'t) sleeping.',3),
(2,@L2S2,'multiple_choice','I ___ to music while I work.','am listening','is listening','are listening','am listen','A','I → am + verb-ing.',4),
(2,@L2S2,'multiple_choice','They ___ because the film is sad.','is crying','are crying','crying','are cry','B','They → are + verb-ing.',5),
(2,@L2S2,'multiple_choice','Which sentence is INCORRECT?','She is knowing the answer.','She is reading a book.','They are playing outside.','He is running to the bus.','A','know is a stative verb — not used with -ing.',6);

-- L2S3: Present Continuous – Questions & Context
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(2,@L2S3,'multiple_choice','___ you listening to me right now?','Do','Are','Is','Were','B','You → Are + verb-ing.',1),
(2,@L2S3,'multiple_choice','What ___ she ___ ?','does / do','is / doing','are / doing','does / doing','B','She → is + verb-ing: What is she doing?',2),
(2,@L2S3,'multiple_choice','I usually ___ coffee, but today I ___ tea.','drink / am drinking','am drinking / drink','drinks / am drinking','drink / drinking','A','Habit → Simple Present; action now → Present Continuous.',3),
(2,@L2S3,'multiple_choice','Look! The dog ___ in the garden.','plays','is playing','play','are playing','B','Action happening now (Look!) → is playing.',4);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(2,@L2S3,'fill_blank','_____ (they/study) right now? Yes, they are.','Are they studying','They → Are + verb-ing form.',5),
(2,@L2S3,'fill_blank','She _____ (not/talk) on the phone at the moment.','isn\'t talking','She → is not (isn\'t) + verb-ing.',6);

-- L3S1: Simple Past – Regular Verbs
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(3,@L3S1,'multiple_choice','She ___ for the exam all week.','studyed','studied','studed','studded','B','study: consonant+y → ied.',1),
(3,@L3S1,'multiple_choice','He ___ the car and drove away.','stoped','stopted','stopped','stopp','C','stop: short vowel+consonant → doubled p.',2),
(3,@L3S1,'multiple_choice','We ___ in Paris for two weeks.','livedde','live','lived','living','C','live → + d: lived.',3),
(3,@L3S1,'multiple_choice','They ___ the game easily. (win)','win','winned','wined','won','D','win is irregular: won.',4),
(3,@L3S1,'multiple_choice','She ___ her keys on the table. (place)','place','placed','placd','placeed','B','place → + d: placed.',5);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(3,@L3S1,'fill_blank','I _____ (carry) all the bags myself yesterday.','carried','carry: consonant+y → ied.',6),
(3,@L3S1,'fill_blank','He _____ (plan) the trip last month.','planned','plan: short vowel+consonant → doubled n.',7);

-- L3S2: Simple Past – Irregular Verbs
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(3,@L3S2,'multiple_choice','We ___ to the beach last Sunday.','goed','gone','go','went','D','go → went.',1),
(3,@L3S2,'multiple_choice','She ___ a cake for the party.','maked','make','made','maded','C','make → made.',2),
(3,@L3S2,'multiple_choice','I ___ a great movie last night.','seen','seed','saw','see','C','see → saw.',3),
(3,@L3S2,'multiple_choice','He ___ me a gift on my birthday.','gived','gave','give','gaven','B','give → gave.',4),
(3,@L3S2,'multiple_choice','They ___ breakfast at 7 this morning.','eated','eat','eaten','ate','D','eat → ate.',5),
(3,@L3S2,'multiple_choice','She ___ a lot of water after the run.','drinked','drunk','drank','drink','C','drink → drank.',6);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(3,@L3S2,'fill_blank','He _____ (buy) a new laptop last week.','bought','buy → bought.',7);

-- L3S3: Simple Past – Negative & Questions
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(3,@L3S3,'multiple_choice','She ___ go to school yesterday — she was ill.','doesn\'t','didn\'t','wasn\'t','isn\'t','B','Past negative: did not (didn\'t) + base verb.',1),
(3,@L3S3,'multiple_choice','___ you finish the report on time?','Were','Do','Have','Did','D','Past question: Did + subject + base verb.',2),
(3,@L3S3,'multiple_choice','They ___ enjoy the concert at all.','don\'t','didn\'t','weren\'t','haven\'t','B','Past negative: didn\'t + base verb.',3),
(3,@L3S3,'multiple_choice','___ she ___ the book before the exam?','Did / read','Does / read','Was / read','Did / reads','A','Did + subject + base verb (read).',4),
(3,@L3S3,'multiple_choice','Which sentence is CORRECT?','I didn\'t went there.','I didn\'t go there.','I not go there.','I went not there.','B','did not + base verb (go, not went).',5);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(3,@L3S3,'fill_blank','_____ (you/see) that film last weekend?','Did you see','Past question: Did + subject + base verb.',6);

-- L4S1: Simple Future – Will
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(4,@L4S1,'multiple_choice','I think it ___ tomorrow.','is going to rain','rained','will rain','rains','C','No visible evidence → will for prediction.',1),
(4,@L4S1,'multiple_choice','Hold on, I ___ the door for you.','am going to open','open','will open','opened','C','Spontaneous decision at the moment → will.',2),
(4,@L4S1,'multiple_choice','She promised she ___ on time.','is going to be','would be','will be','was','C','Promise → will.',3),
(4,@L4S1,'multiple_choice','___ you help me with this box?','Are','Do','Will','Were','C','Request/offer → Will.',4),
(4,@L4S1,'multiple_choice','I think she ___ the competition.','wins','is winning','won','will win','D','Prediction → will.',5);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(4,@L4S1,'fill_blank','Don\'t worry, I _____ (help) you with that.','will help','Spontaneous offer → will + base verb.',6);

-- L4S2: Will vs Going To
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(4,@L4S2,'multiple_choice','Look at those dark clouds! It ___ rain.','will','is going to','goes to','shall','B','Visible evidence → is going to.',1),
(4,@L4S2,'multiple_choice','I bought the tickets. We ___ fly to Tokyo.','will','are going to','shall','might','B','Prior plan → be going to.',2),
(4,@L4S2,'multiple_choice','The phone is ringing. I ___ answer it.','am going to','will','shall','would','B','Spontaneous decision → will.',3),
(4,@L4S2,'multiple_choice','She has decided — she ___ study medicine.','will','is going to','shall','might','B','Prior decision/intention → be going to.',4),
(4,@L4S2,'multiple_choice','I don\'t think he ___ pass — he never studies.','goes to pass','is going to pass','will pass','shall pass','C','General prediction, no specific evidence → will.',5);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(4,@L4S2,'fill_blank','Watch out! You _____ (fall)! (visible danger)','are going to fall','Visible evidence of imminent event → be going to.',6);

-- L5S1: First Conditional – Forming
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(5,@L5S1,'multiple_choice','If it ___ tomorrow, we will cancel the picnic.','rained','will rain','rains','is raining','C','If-clause: Present Simple.',1),
(5,@L5S1,'multiple_choice','If you ___ harder, you will succeed.','worked','work','will work','are working','B','If-clause: Present Simple.',2),
(5,@L5S1,'multiple_choice','She will be upset if you ___ late.','will be','are','were','be','B','If-clause: Present Simple (are).',3),
(5,@L5S1,'multiple_choice','If he passes the exam, he ___ go to university.','would','will','can','might','B','Main clause: will + base verb.',4),
(5,@L5S1,'multiple_choice','Which is a correct First Conditional?','If it will rain, I stay home.','If it rains, I will stay home.','If it rained, I will stay home.','If it rains, I stayed home.','B','If + Present Simple, will + base verb.',5);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(5,@L5S1,'fill_blank','If she _____ (study) now, she will pass.','studies','If-clause: Present Simple, she → studies.',6);

-- L5S2: First Conditional – Real Situations
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(5,@L5S2,'multiple_choice','If I find your wallet, I ___ call you immediately.','would','will','am going to','should','B','Real possible future → will.',1),
(5,@L5S2,'multiple_choice','If you ___ the bus, you will be late.','miss','will miss','missed','are missing','A','If-clause → Present Simple.',2),
(5,@L5S2,'multiple_choice','We ___ be able to leave if we finish the work.','would','will','could','should','B','First conditional main clause → will.',3),
(5,@L5S2,'multiple_choice','If the weather ___ nice, we\'ll go for a walk.','will be','would be','is','was','C','If-clause → Present Simple.',4);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(5,@L5S2,'fill_blank','If you _____ (not/hurry), we will miss the train.','don\'t hurry','Negative if-clause: don\'t + base verb.',5),
(5,@L5S2,'fill_blank','If I see him, I _____ (tell) him the news.','will tell','Main clause: will + base verb.',6);

-- L5S3: First Conditional – Mixed Modals
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(5,@L5S3,'multiple_choice','If you come early, you ___ help us set up.','will','can','would','should','B','can expresses ability/possibility.',1),
(5,@L5S3,'multiple_choice','If she asks, you ___ tell her the truth.','will','can','should','would','C','should expresses advice.',2),
(5,@L5S3,'multiple_choice','If it rains tonight, they ___ cancel the match.','can','might','would','should','B','might expresses possibility.',3),
(5,@L5S3,'multiple_choice','If you need help, I ___ be available.','would','will','might','should','C','might for uncertain availability.',4),
(5,@L5S3,'multiple_choice','If we leave now, we ___ catch the 8 o\'clock train.','can','might','will','should','C','will for certain result if condition is met.',5);

-- L6S1: Second Conditional – Hypothetical
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(6,@L6S1,'multiple_choice','If I ___ a million dollars, I would buy a house.','have','will have','had','would have','C','If-clause: Past Simple (had).',1),
(6,@L6S1,'multiple_choice','If she ___ taller, she would be a basketball player.','is','was','were','would be','C','If-clause: were for hypothetical.',2),
(6,@L6S1,'multiple_choice','He would travel the world if he ___ enough money.','has','will have','had','would have','C','If-clause: Past Simple (had).',3),
(6,@L6S1,'multiple_choice','If I were you, I ___ apologize immediately.','will','would','could','should','B','Main clause: would + base verb.',4),
(6,@L6S1,'multiple_choice','Which is a correct Second Conditional?','If I have time, I would call.','If I had time, I would call.','If I had time, I will call.','If I would have time, I would call.','B','If + Past Simple, would + base verb.',5);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(6,@L6S1,'fill_blank','If she _____ (know) the answer, she would tell us.','knew','If-clause: Past Simple (know → knew).',6);

-- L6S2: First vs Second Conditional
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(6,@L6S2,'multiple_choice','If it rains, I ___ stay inside. (likely)','would','will','could','might','B','Likely/real → First Conditional: will.',1),
(6,@L6S2,'multiple_choice','If I ___ a bird, I would fly everywhere. (imaginary)','am','was','were','will be','C','Imaginary → Second Conditional: were.',2),
(6,@L6S2,'multiple_choice','If you exercise regularly, you ___ feel better. (real advice)','would','will','should','could','B','Real/possible → First Conditional: will.',3),
(6,@L6S2,'multiple_choice','If she ___ the president, she would change the laws. (hypothetical)','is','was','were','will be','C','Hypothetical → Second Conditional: were.',4),
(6,@L6S2,'multiple_choice','Which uses the Second Conditional correctly?','If he works hard, he will pass.','If he works hard, he would pass.','If he worked hard, he would pass.','If he worked hard, he will pass.','C','If + Past Simple, would + base verb.',5);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(6,@L6S2,'fill_blank','If they _____ (live) in the city, they would have more options.','lived','If-clause: Past Simple (live → lived).',6);

-- L7S1: Passive – Present & Past Simple
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(7,@L7S1,'multiple_choice','The room ___ every day. (present passive)','cleans','is cleaned','are cleaned','was cleaned','B','Present simple passive: is + past participle.',1),
(7,@L7S1,'multiple_choice','This bridge ___ in 1920. (past passive)','built','is built','was built','were built','C','Past simple passive: was + past participle.',2),
(7,@L7S1,'multiple_choice','English ___ all over the world. (present passive)','speak','spoke','is spoken','are spoken','C','Present passive: is + spoken.',3),
(7,@L7S1,'multiple_choice','The letter ___ yesterday. (past passive)','sends','was sent','is sent','send','B','Past passive: was + past participle.',4),
(7,@L7S1,'multiple_choice','Many cars ___ in Germany. (present passive)','makes','is made','are made','make','C','Many cars (plural) → are made.',5),
(7,@L7S1,'multiple_choice','The painting ___ by Picasso. (past passive)','was painted','is painting','were painted','paints','A','Past passive: was + painted.',6);

-- L7S2: Passive – Active to Passive
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(7,@L7S2,'multiple_choice','Active: "They clean the office every day." → Passive?','The office clean every day.','The office is cleaned every day.','The office was cleaned every day.','The office are cleaned every day.','B','Present simple passive: is cleaned.',1),
(7,@L7S2,'multiple_choice','Active: "Someone stole my bike." → Passive?','My bike stole.','My bike was stolen.','My bike is stolen.','My bike were stolen.','B','Past simple passive: was stolen.',2),
(7,@L7S2,'multiple_choice','Active: "They will finish the project." → Passive?','The project finished.','The project is finished.','The project will be finished.','The project will finished.','C','Future passive: will be + past participle.',3);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(7,@L7S2,'fill_blank','Active: "She writes the report." → The report _____ by her.','is written','Present simple passive: is + written.',4),
(7,@L7S2,'fill_blank','Active: "They built this church in 1850." → This church _____ in 1850.','was built','Past simple passive: was + built.',5);

-- L7S3: Passive – Advanced Forms
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(7,@L7S3,'multiple_choice','The report ___ already. (Present Perfect Passive)','has been written','is been written','was written','have been written','A','Present perfect passive: has been + past participle.',1),
(7,@L7S3,'multiple_choice','The form ___ before you leave. (Modal Passive)','must sign','must be sign','must be signed','must signed','C','Modal passive: must be + past participle.',2),
(7,@L7S3,'multiple_choice','The new road ___ by year end. (Future Passive)','will finish','will be finished','will been finished','is being finished','B','Future passive: will be + past participle.',3),
(7,@L7S3,'multiple_choice','The results ___ at the moment. (Present Continuous Passive)','is being analyzed','are being analyzed','are analyzed','were being analyzed','B','Present continuous passive: are being + past participle.',4),
(7,@L7S3,'multiple_choice','A cure ___ yet for that disease. (Present Perfect Passive)','hasn\'t found','hasn\'t been found','wasn\'t found','isn\'t found','B','Present perfect passive: has not been + past participle.',5);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(7,@L7S3,'fill_blank','The suspect _____ (question) by police right now. (continuous passive)','is being questioned','Present continuous passive: is being + past participle.',6);

-- L8S1: Relative Clauses – Who, Which, That
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(8,@L8S1,'multiple_choice','The man ___ called yesterday is my uncle.','which','that','whose','where','B','that can refer to people in defining clauses.',1),
(8,@L8S1,'multiple_choice','The book ___ I bought last week is very interesting.','who','whose','which','where','C','which refers to things.',2),
(8,@L8S1,'multiple_choice','She is the student ___ won the prize.','which','that','where','whose','B','that refers to people in defining clauses.',3),
(8,@L8S1,'multiple_choice','The car ___ is parked outside belongs to my neighbor.','who','whom','that','where','C','that refers to things.',4),
(8,@L8S1,'multiple_choice','I met a doctor ___ specialized in neurology.','which','that','where','whose','B','that (or who) refers to a person.',5),
(8,@L8S1,'multiple_choice','The film ___ we watched last night was amazing.','who','that','whose','whom','B','that refers to things.',6);

-- L8S2: Relative Clauses – Where, When, Whose
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(8,@L8S2,'multiple_choice','This is the city ___ I was born.','when','that','which','where','D','where refers to places.',1),
(8,@L8S2,'multiple_choice','I remember the day ___ we first met.','where','which','when','that','C','when refers to time.',2),
(8,@L8S2,'multiple_choice','The woman ___ car was stolen called the police.','who','which','that','whose','D','whose shows possession.',3),
(8,@L8S2,'multiple_choice','The hotel ___ we stayed was very comfortable.','which','that','when','where','D','where refers to places.',4);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(8,@L8S2,'fill_blank','The student _____ phone rang was asked to leave.','whose','whose shows possession.',5),
(8,@L8S2,'fill_blank','2020 was the year _____ everything changed.','when','when refers to a point in time.',6);

-- L8S3: Relative Clauses – Defining vs Non-defining
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(8,@L8S3,'multiple_choice','Which sentence contains a NON-DEFINING relative clause?','The woman who called is my sister.','My sister, who lives in Paris, is visiting.','The book that I bought is good.','I know the man that works here.','B','Non-defining: extra info in commas, not essential.',1),
(8,@L8S3,'multiple_choice','In a non-defining relative clause you can use:','that only','who or which (NOT that)','whose only','where only','B','that is NOT used in non-defining clauses.',2),
(8,@L8S3,'multiple_choice','The Eiffel Tower, ___ was built in 1889, is in Paris.','that','which','who','where','B','Non-defining about a thing → which.',3),
(8,@L8S3,'multiple_choice','My father, ___ is 60, still runs every morning.','that','which','who','whose','C','Non-defining about a person → who.',4),
(8,@L8S3,'multiple_choice','Which sentence is punctuated CORRECTLY?','The man, who I met yesterday, was very kind.','The man who I met yesterday was very kind.','The man who, I met yesterday, was very kind.','The man who I met, yesterday was very kind.','B','Defining relative clause: no commas needed.',5);

-- L9S1: Present Perfect – Forming
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(@L9,@L9S1,'multiple_choice','She ___ her homework. (present perfect)','has finish','has finished','have finished','finished','B','She → has + past participle.',1),
(@L9,@L9S1,'multiple_choice','They ___ this film three times.','have seen','has seen','saw','see','A','They → have + past participle.',2),
(@L9,@L9S1,'multiple_choice','I have never ___ sushi.','eat','ate','eaten','eated','C','Present perfect: have + past participle (eaten).',3),
(@L9,@L9S1,'multiple_choice','___ you ever ___ to Japan?','Did / go','Have / been','Has / gone','Have / went','B','Have + subject + ever + past participle (been).',4),
(@L9,@L9S1,'multiple_choice','He ___ his keys — he can\'t get in.','lost','has lost','have lost','was losing','B','Recent action with present result → has lost.',5);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(@L9,@L9S1,'fill_blank','We _____ (not/see) that film yet.','haven\'t seen','We → have not (haven\'t) + past participle.',6),
(@L9,@L9S1,'fill_blank','_____ (she/finish) the report?','Has she finished','She → Has + subject + past participle.',7);

-- L9S2: Present Perfect – Signal Words
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(@L9,@L9S2,'multiple_choice','I have lived here ___ 5 years.','since','for','ago','during','B','for + duration.',1),
(@L9,@L9S2,'multiple_choice','She has worked at this company ___ 2018.','for','ago','since','during','C','since + starting point.',2),
(@L9,@L9S2,'multiple_choice','Have you done your homework ___?','yet','just','already','since','A','yet in questions/negatives.',3),
(@L9,@L9S2,'multiple_choice','I have ___ had breakfast — I\'m not hungry.','yet','since','already','just','C','already: completed before expected time.',4),
(@L9,@L9S2,'multiple_choice','He has ___ arrived — he\'s still in the car.','already','yet','just','for','C','just: very recently.',5);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(@L9,@L9S2,'fill_blank','They have known each other _____ they were children.','since','since + starting point in the past.',6),
(@L9,@L9S2,'fill_blank','Has she called you _____? No, not yet.','yet','yet used in questions and negatives.',7);

-- L9S3: Present Perfect vs Past Simple
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(@L9,@L9S3,'multiple_choice','I ___ my keys. I can\'t find them. (result now)','lost','have lost','had lost','did lose','B','Present result → Present Perfect.',1),
(@L9,@L9S3,'multiple_choice','She ___ in London from 2010 to 2015. (finished)','has lived','lived','has been living','is living','B','Specific finished time → Past Simple.',2),
(@L9,@L9S3,'multiple_choice','___ you ever eat raw fish? (experience)','Did','Have','Do','Had','B','Life experience → Present Perfect: Have.',3),
(@L9,@L9S3,'multiple_choice','I ___ this book when I was 12. (specific past time)','have read','read','had read','reads','B','Specific past time → Past Simple.',4),
(@L9,@L9S3,'multiple_choice','They ___ three movies this week. (week not finished)','watched','have watched','had watched','watch','B','Unfinished time period → Present Perfect.',5);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(@L9,@L9S3,'fill_blank','I _____ (already/eat), so I\'m not hungry.','have already eaten','Present Perfect with already.',6);

-- L10S1: Articles – A vs An
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(@L10,@L10S1,'multiple_choice','She is ___ engineer.','a','an','the','—','B','engineer starts with vowel sound /e/ → an.',1),
(@L10,@L10S1,'multiple_choice','It was ___ unique experience.','an','a','the','—','B','unique starts with /j/ sound (consonant) → a.',2),
(@L10,@L10S1,'multiple_choice','He has ___ university degree.','an','a','the','—','B','university starts with /j/ sound → a.',3),
(@L10,@L10S1,'multiple_choice','I waited for ___ hour.','a','an','the','—','B','hour: silent h → vowel sound /aʊ/ → an.',4),
(@L10,@L10S1,'multiple_choice','She bought ___ umbrella.','a','an','the','—','B','umbrella starts with /ʌ/ vowel sound → an.',5),
(@L10,@L10S1,'multiple_choice','That is ___ honest answer.','a','an','the','—','B','honest: silent h → vowel sound → an.',6);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(@L10,@L10S1,'fill_blank','I want to become _____ actor.','an','actor starts with vowel /æ/ → an.',7);

-- L10S2: Articles – The or No Article
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(@L10,@L10S2,'multiple_choice','___ Sun is a star.','A','An','The','(no article)','C','Unique things → the.',1),
(@L10,@L10S2,'multiple_choice','I love ___ music in general.','a','an','the','(no article)','D','General uncountable noun → no article.',2),
(@L10,@L10S2,'multiple_choice','___ Amazon is the longest river in South America.','A','An','The','(no article)','C','Rivers → the.',3),
(@L10,@L10S2,'multiple_choice','She speaks ___ French fluently.','a','an','the','(no article)','D','Languages → no article.',4),
(@L10,@L10S2,'multiple_choice','I saw a dog in the park. ___ dog was very friendly.','A','An','The','(no article)','C','Second mention, specific → the.',5),
(@L10,@L10S2,'multiple_choice','We eat ___ breakfast at 7 every morning.','a','an','the','(no article)','D','Meals without adjective → no article.',6);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(@L10,@L10S2,'fill_blank','_____ Pacific Ocean is the largest ocean on Earth.','The','Oceans → the.',7);

-- L11S1: Reported Speech – Statements
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(@L11,@L11S1,'multiple_choice','"I am tired." → She said she ___ tired.','is','was','were','will be','B','Present Simple → Past Simple.',1),
(@L11,@L11S1,'multiple_choice','"I will call you." → He said he ___ call me.','will','would','could','should','B','will → would.',2),
(@L11,@L11S1,'multiple_choice','"We are leaving now." → They said they ___ leaving.','are','were','was','will be','B','Present Continuous → Past Continuous.',3),
(@L11,@L11S1,'multiple_choice','"I can swim." → She said she ___ swim.','can','could','would','should','B','can → could.',4),
(@L11,@L11S1,'multiple_choice','"I have finished." → He said he ___ finished.','has','have','had','was','C','Present Perfect → Past Perfect.',5);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(@L11,@L11S1,'fill_blank','"I like coffee." → She told me she _____ coffee.','liked','Present Simple → Past Simple backshift.',6);

-- L11S2: Reported Speech – Questions
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(@L11,@L11S2,'multiple_choice','"Where do you live?" → He asked where I ___.','live','lived','was living','did live','B','Wh-question reported: no do/does, tense backshift.',1),
(@L11,@L11S2,'multiple_choice','"Do you like tea?" → She asked ___ I liked tea.','that','if','what','whether','D','Yes/no questions: if or whether.',2),
(@L11,@L11S2,'multiple_choice','"Are you coming?" → She asked if I ___.','was coming','am coming','will come','came','A','Present Continuous → Past Continuous.',3),
(@L11,@L11S2,'multiple_choice','"What time is it?" → He asked what time ___.','it is','it was','is it','was it','B','Reported question: statement word order.',4),
(@L11,@L11S2,'multiple_choice','Which reported question is CORRECT?','She asked where did I work.','She asked where I worked.','She asked where I did work.','She asked where do I work.','B','Reported: statement word order (no auxiliary inversion).',5);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(@L11,@L11S2,'fill_blank','"Can you help me?" → She asked _____ help her.','if I could','if + subject + could (can → could).',6);

-- L11S3: Reported Speech – Say vs Tell & Tense Changes
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(@L11,@L11S3,'multiple_choice','She ___ me that she was busy.','said','told','spoke','talked','B','tell + person: told me.',1),
(@L11,@L11S3,'multiple_choice','He ___ that he would be late.','told','said','told me','spoke','B','say + that: said (no direct object).',2),
(@L11,@L11S3,'multiple_choice','"I went to Paris." → She said she ___ to Paris.','went','had gone','has gone','goes','B','Past Simple → Past Perfect.',3),
(@L11,@L11S3,'multiple_choice','Which sentence is INCORRECT?','She told that she was tired.','She said that she was tired.','She told me that she was tired.','She said she was tired.','A','tell needs an object: told me/him/her.',4),
(@L11,@L11S3,'multiple_choice','"I was sleeping." → He said he ___ sleeping.','was','had been','is','were','B','Past Continuous → Past Perfect Continuous.',5);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(@L11,@L11S3,'fill_blank','"We are waiting outside." → They said they _____ outside.','were waiting','Present Continuous → Past Continuous.',6);

-- L12S1: Comparatives
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(@L12,@L12S1,'multiple_choice','This box is ___ than that one. (heavy)','more heavy','heavier','heavyer','most heavy','B','1-syllable CVC: double consonant + er.',1),
(@L12,@L12S1,'multiple_choice','She is ___ than her sister. (tall)','more tall','tallest','taller','most tall','C','1-syllable → + er.',2),
(@L12,@L12S1,'multiple_choice','This film is ___ than the book. (interesting)','interestinger','most interesting','more interesting','interestingest','C','3+ syllables → more + adjective.',3),
(@L12,@L12S1,'multiple_choice','His English is ___ than mine. (good)','more good','gooder','best','better','D','good → better (irregular).',4),
(@L12,@L12S1,'multiple_choice','Today is ___ than yesterday. (bad)','more bad','badder','worse','worst','C','bad → worse (irregular).',5);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(@L12,@L12S1,'fill_blank','She is _____ (happy) than she was last year.','happier','happy: consonant+y → ier.',6),
(@L12,@L12S1,'fill_blank','This road is _____ (dangerous) than the other one.','more dangerous','3+ syllables → more + adjective.',7);

-- L12S2: Superlatives
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(@L12,@L12S2,'multiple_choice','Mount Everest is ___ mountain in the world. (high)','highest','the highest','most high','the most high','B','Superlative: the + adjective + est.',1),
(@L12,@L12S2,'multiple_choice','She is ___ student in the class. (intelligent)','the most intelligent','the intelligentst','the intelligenter','most intelligent','A','3+ syllables → the most + adjective.',2),
(@L12,@L12S2,'multiple_choice','He is ___ person I know. (funny)','the most funny','funniest','the funniest','most funniest','C','funny: y → iest, add the.',3),
(@L12,@L12S2,'multiple_choice','This is ___ film I have ever seen. (bad)','the baddest','the most bad','the worst','the worse','C','bad → the worst (irregular).',4),
(@L12,@L12S2,'multiple_choice','Who is ___ player on the team? (good)','the most good','the goodest','the better','the best','D','good → the best (irregular).',5);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(@L12,@L12S2,'fill_blank','That was _____ (expensive) meal I have ever had.','the most expensive','3+ syllables: the most + adjective.',6),
(@L12,@L12S2,'fill_blank','She is _____ (tall) girl in her school.','the tallest','1-syllable: the + adjective + est.',7);

-- L12S3: As...As & Mixed
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,option_a,option_b,option_c,option_d,correct,explanation,order_index) VALUES
(@L12,@L12S3,'multiple_choice','This bag is ___ that one. (equal weight)','as heavy than','as heavy as','heavy as','heavier as','B','Equal comparison: as + adjective + as.',1),
(@L12,@L12S3,'multiple_choice','He is ___ his father. (not same height)','not as tall as','not taller than','less tall that','not as tall that','A','Negative equal: not as + adjective + as.',2),
(@L12,@L12S3,'multiple_choice','She works ___ anyone in the office. (hardest)','as harder as','the hardest','the most hard','harder','B','Superlative: the hardest.',3),
(@L12,@L12S3,'multiple_choice','This puzzle is ___ I expected. (more difficult)','as difficult as','less difficult','more difficult than','the most difficult','C','Comparative: more + adj + than.',4),
(@L12,@L12S3,'multiple_choice','This is ___ decision he has ever made. (worst)','the worse','worst','the worst','the most bad','C','bad → the worst (irregular superlative).',5);
INSERT INTO grammar_questions (lesson_id,section_id,question_type,question,fill_answer,explanation,order_index) VALUES
(@L12,@L12S3,'fill_blank','She runs _____ (fast) as her brother.','as fast','Equal comparison: as + adjective + as.',6);
