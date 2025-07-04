/**
 * Copyright (c) 2023-2025, AprilNEA LLC.
 *
 * Dual licensed under:
 * - GPL-3.0 (open source)
 * - Commercial license (contact us)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * See LICENSE file for details or contact admin@aprilnea.com
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Read the license files
const licenseMain = readFileSync(join(process.cwd(), 'LICENSE'), 'utf8');
const licenseGPL = readFileSync(join(process.cwd(), 'LICENSE.GPL'), 'utf8');
const licenseCommercial = readFileSync(join(process.cwd(), 'LICENSE.COMMERCIAL'), 'utf8');

// Merge licenses into a full license file
const fullLicense = `${licenseMain}

==================================================
GNU GENERAL PUBLIC LICENSE
==================================================

${licenseGPL}

==================================================
COMMERCIAL LICENSE
==================================================

${licenseCommercial}
`;

// Write the merged license to LICENSE.FULL
writeFileSync(join(process.cwd(), 'LICENSE.FULL'), fullLicense);

console.log('Successfully merged licenses into LICENSE.FULL');
