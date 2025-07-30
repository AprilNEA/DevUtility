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

import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import {
  BrainIcon,
  ClockIcon,
  // FileCode2Icon,
  FileCodeIcon,
  FileIcon,
  FileJson2Icon,
  FileJsonIcon,
  FileTextIcon,
  HashIcon,
  Heading5Icon,
  KeyIcon,
  LinkIcon,
  RadarIcon,
  RotateCcwKeyIcon,
} from "lucide-react";
import { lazy } from "react";
import type { RouteComponentProps } from "wouter";
import Base64Icon from "@/assets/base64-icon";
import CssIcon from "@/assets/css-icon";
import FIDOPasskeyMarkA from "@/assets/fido-passkey-mark-a";
import JWTIcon from "@/assets/jwt-icon";
import NumberIcon from "@/assets/number-icon";
import StringIcon from "@/assets/string-icon";
import UUIDIcon from "@/assets/uuid-icon";
import JwtDecoderPage from "./codec/jwt";
import NumberCasePage from "./converter/number-case";
import StringInspectorPage from "./converter/string-inspector";
import Fido2Page from "./cryptography/fido/fido2";
import IpPage from "./network/ip";

const GptTokenizerPage = lazy(() => import("./ai/tokenizer"));
const JsonFormatterPage = lazy(() => import("./formatter/json"));
const HtmlEncoderDecoderPage = lazy(() => import("./formatter/html"));
const CssBeautifyMinifyToolPage = lazy(() => import("./formatter/css"));
const IdGeneratorPage = lazy(() => import("./generators/id"));
const HashGeneratorPage = lazy(() => import("./generators/hash"));
const Base64EncoderDecoderPage = lazy(() => import("./codec/base64"));
const RSAKeyGeneratorPage = lazy(() => import("./cryptography/rsa/generator"));
const RSAKeyAnalyzerPage = lazy(() => import("./cryptography/rsa/analyzer"));
const NumberCaseConverterPage = lazy(() => import("./converter/number-case"));
// const RSAKeyConverterPage = lazy(() => import("./cryptography/rsa/converter"));
// const HotpDebuggerPage = lazy(() => import("./cryptography/oath/hotp"));
const TotpDebuggerPage = lazy(() => import("./cryptography/oath/totp"));
// const HidDevicesPage = lazy(() => import("./hardware/hid"));
const UnixTimePage = lazy(() => import("./converter/unix-time"));

export type Utility = {
  key: string;
  icon: React.ElementType;
  title: MessageDescriptor;
  page: React.ComponentType<
    RouteComponentProps<{ [param: number]: string | undefined }>
  >;
};

export type UtilityGroup = {
  key: string;
  icon?: React.ElementType;
  title: MessageDescriptor;
  items: UtilityMeta[];
};

export type UtilityMeta = Utility | UtilityGroup;

const utilities: UtilityMeta[] = [
  {
    key: "ai",
    title: msg`AI`,
    items: [
      {
        key: "tokenizer",
        icon: BrainIcon,
        title: msg`Tokenizer`,
        page: GptTokenizerPage,
      },
    ],
  },
  {
    key: "formatter",
    icon: FileIcon,
    title: msg`Format / Validate / Minify`,
    items: [
      {
        key: "json",
        icon: FileJson2Icon,
        title: msg`JSON Format/Validate`,
        page: JsonFormatterPage,
      },
      {
        key: "html",
        icon: Heading5Icon,
        title: msg`HTML Beautify/Minify`,
        page: HtmlEncoderDecoderPage,
      },
      {
        key: "css",
        icon: CssIcon,
        title: msg`CSS Beautify/Minify`,
        page: CssBeautifyMinifyToolPage,
      },
      // {
      //   key: "javascript",
      //   icon: FileCode2Icon,
      //   title: msg`JS Beautify/Minify`,
      //   page: CssBeautifyMinifyToolPage,
      // },
    ],
  },
  {
    key: "generator",
    title: msg`Generators`,
    items: [
      {
        key: "id",
        icon: UUIDIcon,
        title: msg`UUID/ULID Generate/Decode`,
        page: IdGeneratorPage,
      },
      {
        key: "hash",
        icon: HashIcon,
        title: msg`Hash Generator`,
        page: HashGeneratorPage,
      },
    ],
  },
  {
    key: "converter",
    title: msg`Converter`,
    items: [
      {
        key: "number-case",
        icon: NumberIcon,
        title: msg`Number Base Converter`,
        page: NumberCaseConverterPage,
      },
      {
        key: "string-inspector",
        icon: StringIcon,
        title: msg`String Inspector`,
        page: StringInspectorPage,
      },
      {
        key: "unix-time",
        icon: ClockIcon,
        title: msg`Unix Time Converter`,
        page: UnixTimePage,
      },
      // {
      //   key: "url-parser",
      //   title: msg`URL Parser`,

      //   icon: LinkIcon,
      // },
    ],
  },
  {
    key: "cryptography",
    icon: KeyIcon,
    title: msg`Cryptography & Security`,
    items: [
      {
        key: "fido",
        icon: FIDOPasskeyMarkA,
        title: msg`FIDO Debugger`,
        page: Fido2Page,
      },

      {
        key: "totp",
        icon: KeyIcon,
        title: msg`TOTP Debugger`,
        page: TotpDebuggerPage,
      },
      {
        key: "rsa",
        icon: KeyIcon,
        title: msg`RSA Debugger`,
        items: [
          {
            key: "generator",
            icon: RotateCcwKeyIcon,
            title: msg`Key Generator`,
            page: RSAKeyGeneratorPage,
          },
          {
            key: "analyzer",
            icon: RadarIcon,
            title: msg`Key Analyzer`,
            page: RSAKeyAnalyzerPage,
          },
        ],
      },
      // {
      //   key: "aes-debugger",
      //   icon: KeyIcon,
      //   title: msg`AES Debugger`,
      //   page: AesDebuggerPage,
      // },
    ],
  },
  {
    key: "codec",
    icon: FileTextIcon,
    title: msg`Encoder, Decoder`,
    items: [
      {
        key: "base64",
        icon: Base64Icon,
        title: msg`Base64 Encode/Decode`,
        page: Base64EncoderDecoderPage,
      },
      {
        key: "jwt",
        icon: JWTIcon,
        title: msg`JWT Decoder`,
        page: JwtDecoderPage,
      },
    ],
  },
  {
    key: "network",
    title: msg`Network`,
    items: [
      {
        key: "ip",
        icon: LinkIcon,
        title: msg`IP Address Calculator`,
        page: IpPage,
      },
    ],
  },
  // {
  //   key: "hardware",
  //   title: msg`Hardware`,
  //   items: [
  //     {
  //       key: "hid",
  //       icon: UsbIcon,
  //       title: msg`HID Devices`,
  //       page: HidDevicesPage,
  //     },
  //   ],
  // },
];

export default utilities;
