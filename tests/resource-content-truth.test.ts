import {it,expect} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {AccessibilityCommitmentSection} from '../resources/sections/accessibility-commitment-section/index.js';
it('portable accessibility section describes goals without inventing certification',()=>{
 const html=renderToStaticMarkup(createElement(AccessibilityCommitmentSection));
 expect(html).not.toContain('AA CERTIFIED');
 expect(html).not.toContain('100% of interactive');
 expect(html).toContain('WCAG 2.2 AA target');
});
