import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import {
  FileCode2Icon,
  FileCodeIcon,
  FileIcon,
  FileJsonIcon,
  FileTextIcon,
  HashIcon,
  KeyIcon,
  LinkIcon,
  RadarIcon,
  RotateCcwKeyIcon,
} from "lucide-react";
import type { RouteComponentProps } from "wouter";
import { lazy } from "react";

const JsonFormatterPage = lazy(() => import("./formatter/json"));
const HtmlEncoderDecoderPage = lazy(() => import("./formatter/html"));
const CssBeautifyMinifyToolPage = lazy(() => import("./formatter/css"));
const IdGeneratorPage = lazy(() => import("./generators/id"));
const HashGeneratorPage = lazy(() => import("./generators/hash"));
const Base64EncoderDecoderPage = lazy(() => import("./codec/base64"));
const RSAKeyGeneratorPage = lazy(() => import("./cryptography/rsa/generator"));
const RSAKeyAnalyzerPage = lazy(() => import("./cryptography/rsa/analyzer"));
// const RSAKeyConverterPage = lazy(() => import("./cryptography/rsa/converter"));
// const HotpDebuggerPage = lazy(() => import("./cryptography/oath/hotp"));
const TotpDebuggerPage = lazy(() => import("./cryptography/oath/totp"));

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
    key: "formatter",
    icon: FileIcon,
    title: msg`Format / Validate / Minify`,
    items: [
      {
        key: "json",
        icon: FileJsonIcon,
        title: msg`JSON Format/Validate`,
        page: JsonFormatterPage,
      },
      {
        key: "html",
        icon: FileCodeIcon,
        title: msg`HTML Beautify/Minify`,
        page: HtmlEncoderDecoderPage,
      },
      {
        key: "css",
        icon: FileIcon,
        title: msg`CSS Beautify/Minify`,
        page: CssBeautifyMinifyToolPage,
      },
      {
        key: "javascript",
        icon: FileCode2Icon,
        title: msg`JS Beautify/Minify`,
        page: CssBeautifyMinifyToolPage,
      },
    ],
  },
  // {
  //   key: "converter",
  //   icon: LinkIcon,
  //   title: msg`Data Converter`,
  //   utilities: [
  //     {
  //       key: "url-parser",
  //       title: msg`URL Parser`,

  //       icon: LinkIcon,
  //     },
  //   ],
  // },
  {
    key: "generator",
    title: msg`Generators`,
    items: [
      {
        key: "id",
        icon: HashIcon,
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
    key: "cryptography",
    icon: KeyIcon,
    title: msg`Cryptography & Security`,
    items: [
      {
        key: "oath",
        icon: KeyIcon,
        title: msg`OATH Debugger`,
        items: [
          // {
          //   key: "hotp",
          //   icon: KeyIcon,
          //   title: msg`HOTP Debugger`,
          //   page: HotpDebuggerPage,
          // },
          {
            key: "totp",
            icon: KeyIcon,
            title: msg`TOTP Debugger`,
            page: TotpDebuggerPage,
          },
        ],
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
        icon: FileTextIcon,
        title: msg`Base64 Encode/Decode`,
        page: Base64EncoderDecoderPage,
      },
    ],
  },
];

export default utilities;
