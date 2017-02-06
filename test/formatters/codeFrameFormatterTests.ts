/*
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as colors from "colors";

import * as ts from "typescript";

import {RuleSeverity} from "../../src/language/rule/rule";
import {IFormatter, RuleFailure, TestUtils} from "../lint";

describe("CodeFrame Formatter", () => {
    const TEST_FILE = "formatters/codeFrameFormatter.test.ts";
    let sourceFile: ts.SourceFile;
    let formatter: IFormatter;

    before(() => {
        (colors as any).enabled = true;
        const Formatter = TestUtils.getFormatter("codeFrame");
        sourceFile = TestUtils.getSourceFile(TEST_FILE);
        formatter = new Formatter();
    });

    it("formats failures", () => {
        const maxPosition = sourceFile.getFullWidth();

        const failures = [
            new RuleFailure(sourceFile, 0, 1, "first failure", RuleSeverity.ERROR, "first-name"),
            new RuleFailure(sourceFile, 2, 3, "&<>'\" should be escaped", RuleSeverity.ERROR, "escape"),
            new RuleFailure(sourceFile, maxPosition - 1, maxPosition, "last failure", RuleSeverity.ERROR, "last-name"),
            new RuleFailure(sourceFile, 0, maxPosition, "full failure", RuleSeverity.ERROR, "full-name"),
        ];

        const expectedResultPlain =
            `formatters/codeFrameFormatter.test.ts
            first failure (first-name)
            > 1 | module CodeFrameModule {
            2 |     export class CodeFrameClass {
            3 |         private name: string;
            4 |

            &<>'" should be escaped (escape)
            > 1 | module CodeFrameModule {
                |  ^
            2 |     export class CodeFrameClass {
            3 |         private name: string;
            4 |

            last failure (last-name)
            7 |         }
            8 |     }
            >  9 | }
                | ^
            10 |

            full failure (full-name)
            > 1 | module CodeFrameModule {
            2 |     export class CodeFrameClass {
            3 |         private name: string;
            4 |

        `;

        const expectedResultColored =
            `formatters/codeFrameFormatter.test.ts
            \u001b[31mfirst failure\u001b[39m \u001b[90m(first-name)\u001b[39m
            \u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 1 | \u001b[39mmodule \u001b[33mCodeFrameModule\u001b[39m {
            \u001b[90m 2 | \u001b[39m    \u001b[36mexport\u001b[39m \u001b[36mclass\u001b[39m \u001b[33mCodeFrameClass\u001b[39m {
            \u001b[90m 3 | \u001b[39m        private name\u001b[33m:\u001b[39m string\u001b[33m;\u001b[39m
            \u001b[90m 4 | \u001b[39m\u001b[0m

            \u001b[31m&<>'\" should be escaped\u001b[39m \u001b[90m(escape)\u001b[39m
            \u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 1 | \u001b[39mmodule \u001b[33mCodeFrameModule\u001b[39m {
            \u001b[90m   | \u001b[39m \u001b[31m\u001b[1m^\u001b[22m\u001b[39m
            \u001b[90m 2 | \u001b[39m    \u001b[36mexport\u001b[39m \u001b[36mclass\u001b[39m \u001b[33mCodeFrameClass\u001b[39m {
            \u001b[90m 3 | \u001b[39m        private name\u001b[33m:\u001b[39m string\u001b[33m;\u001b[39m
            \u001b[90m 4 | \u001b[39m\u001b[0m

            \u001b[31mlast failure\u001b[39m \u001b[90m(last-name)\u001b[39m
            \u001b[0m \u001b[90m  7 | \u001b[39m        }
            \u001b[90m  8 | \u001b[39m    }
            \u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m  9 | \u001b[39m}
            \u001b[90m    | \u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m
            \u001b[90m 10 | \u001b[39m\u001b[0m

            \u001b[31mfull failure\u001b[39m \u001b[90m(full-name)\u001b[39m
            \u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 1 | \u001b[39mmodule \u001b[33mCodeFrameModule\u001b[39m {
            \u001b[90m 2 | \u001b[39m    \u001b[36mexport\u001b[39m \u001b[36mclass\u001b[39m \u001b[33mCodeFrameClass\u001b[39m {
            \u001b[90m 3 | \u001b[39m        private name\u001b[33m:\u001b[39m string\u001b[33m;\u001b[39m
            \u001b[90m 4 | \u001b[39m\u001b[0m

        `;

        /** Convert output lines to an array of trimmed lines for easier comparing */
        function toTrimmedLines(lines: string): string[] {
            return lines.split("\n").map((line) => line.trim());
        }

        const expectedResult = toTrimmedLines(colors.enabled ? expectedResultColored : expectedResultPlain);
        const result = toTrimmedLines(formatter.format(failures));

        assert.deepEqual(result, expectedResult);
    });

    it("handles no failures", () => {
        const result = formatter.format([]);
        assert.equal(result, "\n");
    });
});
