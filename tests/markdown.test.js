import test from 'node:test';
import assert from 'node:assert/strict';
import { tidyMarkdown } from '../src/markdown.js';

test('bold around punctuation is removed, normal bold stays', () => {
  assert.equal(tidyMarkdown('Ich weiss**,** dass du recht hast.'), 'Ich weiss, dass du recht hast.');
  assert.equal(tidyMarkdown('Das ist **wichtig**, merk dir das.'), 'Das ist **wichtig**, merk dir das.');
  assert.equal(tidyMarkdown('Ende**.**'), 'Ende.');
  assert.equal(tidyMarkdown('3 __+__ 4'), '3 + 4');
});
