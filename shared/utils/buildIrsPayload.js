import { formMapping } from '../../frontend/src/questions/formMapping.js';

export function buildIrsPayload(validatedAnswers) {
  const payload = {
    forms: {},
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'Powered by Pi - Death & Taxes',
    },
  };

  Object.entries(validatedAnswers).forEach(([key, value]) => {
    const lookupKey = key.startsWith('incomeSources.') ? key.split('.')[1] : key;
    const meta = formMapping[lookupKey];

    if (!meta || !meta.form || !meta.line) return;

    if (!payload.forms[meta.form]) {
      payload.forms[meta.form] = {};
    }

    payload.forms[meta.form][meta.line] = value;
  });

  return payload;
}