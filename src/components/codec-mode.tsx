/**
 * Copyright (c) 2023-2025, ApriilNEA LLC.
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

import { Trans } from "@lingui/react/macro";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export enum CodecMode {
  Encode = "encode",
  Decode = "decode",
}

const CodecModeRadio = ({
  mode,
  setMode,
}: {
  mode: CodecMode;
  setMode: (mode: CodecMode) => void;
}) => {
  return (
    <RadioGroup
      defaultValue={mode}
      value={mode}
      onValueChange={(value: CodecMode) => setMode(value)}
      className="flex items-center"
    >
      <div className="flex items-center space-x-1">
        <RadioGroupItem value="encode" id="r-encode" />
        <Label htmlFor="r-encode" className="text-sm font-normal">
          <Trans>Encode</Trans>
        </Label>
      </div>
      <div className="flex items-center space-x-1">
        <RadioGroupItem value="decode" id="r-decode" />
        <Label htmlFor="r-decode" className="text-sm font-normal">
          <Trans>Decode</Trans>
        </Label>
      </div>
    </RadioGroup>
  );
};

export default CodecModeRadio;
