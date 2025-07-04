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

import {
  AlertTriangle,
  Calculator,
  CheckCircle,
  Copy,
  FileTextIcon,
  Hash,
  Info,
  Key,
  Loader2Icon,
  Lock,
  Shield,
} from "lucide-react";
import { createContext, useContext, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard } from "@/lib/copyboard";
import { useUtilityInvoke } from "@/utilities/invoke";
import { InvokeFunction, type RsaKeyAnalysis } from "@/utilities/types";

const RSAKeyAnalyzerContext = createContext<{
  data: RsaKeyAnalysis;
  trigger: (data: { key: string }) => Promise<void>;
  isMutating: boolean;

  formatNumber: (value?: string, hexValue?: string) => string;
} | null>(null);

const useRSAKeyAnalyzer = () => {
  const context = useContext(RSAKeyAnalyzerContext);
  if (!context) {
    throw new Error(
      "useRSAKeyAnalyzer must be used within a RSAKeyAnalyzerProvider",
    );
  }
  return context;
};

const Overview: React.FC<{ data: RsaKeyAnalysis }> = ({ data }) => {
  const { formatNumber } = useRSAKeyAnalyzer();
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">密钥类型</p>
                <p className="font-semibold">
                  {data.keyType === "Private" ? "RSA私钥" : "RSA公钥"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">密钥长度</p>
                <p className="font-semibold">{data.keySize} bits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">公钥指数</p>
                <p className="font-semibold">{data?.publicParams?.e}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">字节长度</p>
                <p className="font-semibold">
                  {data?.derivedParams?.keySizeBytes} bytes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 安全性分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            安全性评估
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium">密钥强度</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {data.keySize >= 2048 ? "符合当前安全标准" : "建议升级密钥长度"}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="font-medium">推荐用途</span>
              </div>
              <p className="text-sm text-muted-foreground">
                适用于数字签名和数据加密
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="font-medium">有效期建议</span>
              </div>
              <p className="text-sm text-muted-foreground">
                建议3-5年内更换密钥对
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const PublicKeyParams: React.FC<{ data: RsaKeyAnalysis }> = ({ data }) => {
  const { formatNumber } = useRSAKeyAnalyzer();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          公钥参数
        </CardTitle>
        <CardDescription>RSA公钥的数学参数，可以公开分享</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 模数 n */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              模数 (n) - {data.publicParams?.nBits} bits
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                copyToClipboard(
                  formatNumber(data.publicParams?.n, data.publicParams?.nHex),
                )
              }
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <div className="bg-muted p-4 rounded-lg font-mono text-xs break-all leading-relaxed">
            {formatNumber(data.publicParams?.n, data.publicParams?.nHex)}
          </div>
          <p className="text-xs text-muted-foreground">
            n = p × q，是两个大质数的乘积，构成RSA加密的基础
          </p>
        </div>

        {/* 公钥指数 e */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">公钥指数 (e)</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                copyToClipboard(
                  formatNumber(data.publicParams?.e, data.publicParams?.eHex),
                )
              }
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <div className="bg-muted p-4 rounded-lg font-mono text-sm">
            {formatNumber(data.publicParams?.e, data.publicParams?.eHex)}
          </div>
          <p className="text-xs text-muted-foreground">
            常用值65537 (0x10001)，与φ(n)互质，用于加密运算
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const PrivateKeyParams: React.FC<{ data: RsaKeyAnalysis }> = ({ data }) => {
  const { formatNumber } = useRSAKeyAnalyzer();
  const [showPrivateParams, setShowPrivateParams] = useState(false);

  return (
    <>
      {!showPrivateParams && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>安全警告：</strong>{" "}
            私钥参数包含敏感信息，请确保在安全环境中查看。
            请开启"显示私钥参数"开关来查看详细信息。
          </AlertDescription>
        </Alert>
      )}

      {showPrivateParams && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              私钥参数
            </CardTitle>
            <CardDescription>
              RSA私钥的敏感数学参数，必须严格保密
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            {/* 私钥指数 d */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">私钥指数 (d)</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      formatNumber(
                        data.privateParams?.d,
                        data.privateParams?.dHex,
                      ),
                    )
                  }
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg font-mono text-xs break-all leading-relaxed">
                {formatNumber(data.privateParams?.d, data.privateParams?.dHex)}
              </div>
              <p className="text-xs text-muted-foreground">
                d ≡ e⁻¹ (mod φ(n))，私钥指数，用于解密和签名运算
              </p>
            </div>

            {/* 质数 p 和 q */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">质数 p</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        formatNumber(
                          data.privateParams?.p,
                          data.privateParams?.pHex,
                        ),
                      )
                    }
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg font-mono text-xs break-all leading-relaxed">
                  {formatNumber(
                    data.privateParams?.p,
                    data.privateParams?.pHex,
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  第一个大质数因子
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">质数 q</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        formatNumber(
                          data?.privateParams?.q,
                          data.privateParams?.qHex,
                        ),
                      )
                    }
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg font-mono text-xs break-all leading-relaxed">
                  {formatNumber(
                    data.privateParams?.q,
                    data.privateParams?.qHex,
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  第二个大质数因子
                </p>
              </div>
            </div>

            {/* CRT 参数 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">
                中国剩余定理(CRT)优化参数
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">指数1 (dp)</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          formatNumber(
                            data.privateParams?.dp,
                            data.privateParams?.dpHex,
                          ),
                        )
                      }
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg font-mono text-xs break-all leading-relaxed">
                    {formatNumber(
                      data.privateParams?.dp,
                      data.privateParams?.dpHex,
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    dp ≡ d (mod p-1)
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">指数2 (dq)</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          formatNumber(
                            data.privateParams?.dq,
                            data.privateParams?.dqHex,
                          ),
                        )
                      }
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg font-mono text-xs break-all leading-relaxed">
                    {formatNumber(
                      data.privateParams?.dq,
                      data.privateParams?.dqHex,
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    dq ≡ d (mod q-1)
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">系数 (qinv)</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        formatNumber(
                          data.privateParams?.qinv,
                          data.privateParams?.qinvHex,
                        ),
                      )
                    }
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg font-mono text-xs break-all leading-relaxed">
                  {formatNumber(
                    data.privateParams?.qinv,
                    data.privateParams?.qinvHex,
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  qinv ≡ q⁻¹ (mod p)，用于CRT快速计算
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default function RSAKeyAnalyzer() {
  const { data, trigger, isMutating } = useUtilityInvoke(
    InvokeFunction.AnalyzeRsaKey,
  );
  const [inputKey, setInputKey] = useState<string>("");
  const [inputKeyType, setInputKeyType] = useState("public");

  const [showHexFormat, setShowHexFormat] = useState(false);
  const [showPrivateParams, setShowPrivateParams] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");

  const handleAnalyzeKey = async () => {
    await trigger({
      key: inputKey,
    });
  };

  const copyToClipboard = (text?: string) => {
    navigator.clipboard.writeText(text ?? "");
  };

  const formatNumber = (value?: string, hexValue?: string) => {
    if (!value) return "";
    if (showHexFormat && hexValue) {
      return hexValue
        .toUpperCase()
        .replace(/(.{2})/g, "$1 ")
        .trim();
    }
    return value;
  };

  const getSecurityLevel = (keySize: number) => {
    if (keySize >= 4096)
      return {
        level: "high",
        text: "高安全性",
        color: "bg-green-100 text-green-800 border-green-200",
      };
    if (keySize >= 2048)
      return {
        level: "medium",
        text: "中等安全性",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      };
    return {
      level: "low",
      text: "低安全性",
      color: "bg-red-100 text-red-800 border-red-200",
    };
  };

  // const security = getSecurityLevel(keyData.key_size);
  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Shield className="w-6 h-6" />
              RSA公私钥分解器
            </CardTitle>
            <CardDescription className="text-lg">
              输入PEM格式的RSA公钥或私钥，获取详细的密钥参数分析
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Tabs
              value={inputKeyType}
              onValueChange={setInputKeyType}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="public" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  公钥分析
                </TabsTrigger>
                <TabsTrigger
                  value="private"
                  className="flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  私钥分析
                </TabsTrigger>
              </TabsList>

              <TabsContent value="public" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    RSA公钥 (PEM格式)
                  </label>
                  <Textarea
                    placeholder="请粘贴PEM格式的RSA公钥..."
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      支持 -----BEGIN PUBLIC KEY----- 格式
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      // onClick={() => setKeyInput(exampleKeys.public)}
                    >
                      <FileTextIcon className="w-3 h-3 mr-1" />
                      使用示例
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="private" className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>安全提醒：</strong>{" "}
                    请确保在安全环境中输入私钥，避免在公共或不受信任的设备上使用此功能。
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    RSA私钥 (PEM格式)
                  </label>
                  <Textarea
                    placeholder="请粘贴PEM格式的RSA私钥..."
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      支持 -----BEGIN PRIVATE KEY----- 或 -----BEGIN RSA PRIVATE
                      KEY----- 格式
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      // onClick={() => setKeyInput(exampleKeys.private)}
                    >
                      <FileTextIcon className="w-3 h-3 mr-1" />
                      使用示例
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-4">
              <Button
                onClick={handleAnalyzeKey}
                className="w-full"
                size="lg"
                disabled={!inputKey.trim() || isMutating}
              >
                {isMutating ? (
                  <>
                    <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                    正在分析密钥...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    开始分析密钥
                  </>
                )}
              </Button>

              {/* 功能说明 */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    分析功能说明
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>提取密钥的所有数学参数</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>计算派生参数和数学关系</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>评估密钥安全性和强度</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>支持十进制和十六进制显示</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const security = getSecurityLevel(data.keySize);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 标题和控制面板 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                RSA密钥分析结果
              </CardTitle>
              <CardDescription>
                详细的RSA {data.keySize}位
                {data.keyType === "Private" ? "私钥" : "公钥"}参数分析
              </CardDescription>
            </div>
            <Badge className={security.color}>
              <Shield className="w-3 h-3 mr-1" />
              {security.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="hex-format"
                  checked={showHexFormat}
                  onCheckedChange={setShowHexFormat}
                />
                <label htmlFor="hex-format" className="text-sm font-medium">
                  十六进制显示
                </label>
              </div>
              {data.keyType === "Private" && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-private"
                    checked={showPrivateParams}
                    onCheckedChange={setShowPrivateParams}
                  />
                  <label htmlFor="show-private" className="text-sm font-medium">
                    显示私钥参数
                  </label>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="public">公钥参数</TabsTrigger>
          <TabsTrigger value="private">私钥参数</TabsTrigger>
          <TabsTrigger value="derived">派生参数</TabsTrigger>
        </TabsList>

        {/* 概览标签页 */}
        <TabsContent value="overview" className="space-y-6"></TabsContent>

        {/* 公钥参数标签页 */}
        <TabsContent value="public" className="space-y-6"></TabsContent>

        {/* 私钥参数标签页 */}
        <TabsContent value="private" className="space-y-6"></TabsContent>

        {/* 派生参数标签页 */}
        <TabsContent value="derived" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                派生参数
              </CardTitle>
              <CardDescription>从基本参数计算得出的数学关系</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 欧拉函数 φ(n) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">欧拉函数 φ(n)</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(data.derivedParams?.phiN)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg font-mono text-xs break-all leading-relaxed">
                  {data.derivedParams?.phiN}
                </div>
                <p className="text-xs text-muted-foreground">
                  φ(n) = (p-1) × (q-1)，小于n且与n互质的正整数个数
                </p>
              </div>

              {/* 卡迈克尔函数 λ(n) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    卡迈克尔函数 λ(n)
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(data.derivedParams?.lambdaN)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg font-mono text-xs break-all leading-relaxed">
                  {data.derivedParams?.lambdaN}
                </div>
                <p className="text-xs text-muted-foreground">
                  λ(n) = lcm(p-1, q-1)，用于计算私钥指数的最小值
                </p>
              </div>

              {/* p-1 和 q-1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">p - 1</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(data.derivedParams?.pMinus1)
                      }
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg font-mono text-xs break-all leading-relaxed">
                    {data.derivedParams?.pMinus1}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">q - 1</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(data.derivedParams?.qMinus1)
                      }
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg font-mono text-xs break-all leading-relaxed">
                    {data.derivedParams?.qMinus1}
                  </div>
                </div>
              </div>

              {/* 数学关系验证 */}
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg">数学关系验证</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>n = p × q</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>φ(n) = (p-1) × (q-1)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>d × e ≡ 1 (mod φ(n))</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>gcd(e, φ(n)) = 1</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
