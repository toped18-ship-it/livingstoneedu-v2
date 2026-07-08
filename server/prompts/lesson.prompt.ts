export function getLessonUserPrompt(
  subject: string,
  classLevel: string,
  term: string,
  week: string,
  storedTopic: string
): string {

return `
Generate a COMPLETE lesson note.

Subject:
${subject}

Class:
${classLevel}

Term:
${term}

Week:
${week}

Topic:
${storedTopic}

Requirements:

Teach ONLY this topic.

Assume the student has never learned it before.

Start from the basic definition.

Gradually explain every concept.

Include numerous Nigerian examples.

Include worked examples.

Include formula derivations where applicable.

Include diagrams using Markdown.

Include comparison tables where applicable.

Include examination-style explanations where appropriate.

Do not summarize.

Do not shorten the lesson.

Produce a lesson that is classroom-ready and detailed enough for a teacher to teach directly from it.

Return ONLY the JSON object required by the schema.
`;
}
