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
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeySquare, Puzzle, Shuffle } from "lucide-react";

// Key Generator Component
function KeyGenerator() {
  const [keyBitLength, setKeyBitLength] = useState<string>("2048");
  const [generatedPublicKey, setGeneratedPublicKey] = useState<string>("");
  const [generatedPrivateKey, setGeneratedPrivateKey] = useState<string>("");

  const onGenerateKeyPair = () => {
    setGeneratedPublicKey("");
    setGeneratedPrivateKey("");
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>RSA密钥对生成器</CardTitle>
        <CardDescription>选择密钥位长并生成新的RSA公私钥对。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="keyBitLength">密钥位长</Label>
          <Select value={keyBitLength} onValueChange={setKeyBitLength}>
            <SelectTrigger id="keyBitLength">
              <SelectValue placeholder="选择位长" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1024">1024位</SelectItem>
              <SelectItem value="2048">2048位</SelectItem>
              <SelectItem value="4096">4096位</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => alert(`生成 ${keyBitLength}位 密钥对... (占位符)`)}
        >
          <KeySquare className="mr-2 h-4 w-4" /> 生成密钥对
        </Button>
        <div>
          <Label htmlFor="generatedPublicKey">公钥 (PEM)</Label>
          <Textarea
            id="generatedPublicKey"
            placeholder="生成的公钥将显示在此处"
            rows={6}
            readOnly
            value={generatedPublicKey}
          />
        </div>
        <div>
          <Label htmlFor="generatedPrivateKey">私钥 (PEM)</Label>
          <Textarea
            id="generatedPrivateKey"
            placeholder="生成的私钥将显示在此处"
            rows={10}
            readOnly
            value={generatedPrivateKey}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Key Analyzer Component
function KeyAnalyzer() {
  const [keyToAnalyze, setKeyToAnalyze] = useState<string>("");
  const [keyAnalysisResult, setKeyAnalysisResult] = useState<string>("");
  const [analyzeKeyType, setAnalyzeKeyType] = useState<"public" | "private">(
    "public"
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>公私钥分解器</CardTitle>
        <CardDescription>
          输入PEM格式的公钥或私钥进行分析 (n, e, d, p, q 等参数)。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs
          defaultValue="publicKeyAnalyze"
          onValueChange={(value: string) =>
            setAnalyzeKeyType(value as "public" | "private")
          }
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="public">公钥分析</TabsTrigger>
            <TabsTrigger value="private">私钥分析</TabsTrigger>
          </TabsList>
          <TabsContent value="public">
            <Label htmlFor="publicKeyInputAnalyze">公钥 (PEM)</Label>
            <Textarea
              id="publicKeyInputAnalyze"
              placeholder="在此处粘贴公钥"
              rows={8}
              value={analyzeKeyType === "public" ? keyToAnalyze : ""}
              onChange={(e) => setKeyToAnalyze(e.target.value)}
            />
          </TabsContent>
          <TabsContent value="private">
            <Label htmlFor="privateKeyInputAnalyze">私钥 (PEM)</Label>
            <Textarea
              id="privateKeyInputAnalyze"
              placeholder="在此处粘贴私钥"
              rows={12}
              value={analyzeKeyType === "private" ? keyToAnalyze : ""}
              onChange={(e) => setKeyToAnalyze(e.target.value)}
            />
          </TabsContent>
        </Tabs>
        <Button
          onClick={() => alert(`分析 ${analyzeKeyType} 密钥... (占位符)`)}
        >
          <Puzzle className="mr-2 h-4 w-4" /> 分析密钥
        </Button>
        <div>
          <Label htmlFor="analysisResult">分析结果</Label>
          <Textarea
            id="analysisResult"
            placeholder="密钥参数将显示在此处"
            rows={10}
            readOnly
            value={keyAnalysisResult}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Format Converter Component
function FormatConverter() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>PEM/DER/JWK 格式转换器</CardTitle>
        <CardDescription>在不同的密钥格式之间进行转换。</CardDescription>
      </CardHeader>
      <CardContent>
        <p>格式转换器界面正在建设中。</p>
        {/* TODO: Add UI for format conversion */}
      </CardContent>
    </Card>
  );
}

// Main Component
export default function RSABasicToolsPage() {
  return (
    <Tabs defaultValue="keyGenerator" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="keyGenerator">
          <KeySquare className="mr-2 h-4 w-4" /> 密钥对生成器
        </TabsTrigger>
        <TabsTrigger value="keyAnalyzer">
          <Puzzle className="mr-2 h-4 w-4" /> 公私钥分解器
        </TabsTrigger>
        <TabsTrigger value="formatConverter">
          <Shuffle className="mr-2 h-4 w-4" /> 格式转换器
        </TabsTrigger>
      </TabsList>

      <TabsContent value="keyGenerator">
        <KeyGenerator />
      </TabsContent>

      <TabsContent value="keyAnalyzer">
        <KeyAnalyzer />
      </TabsContent>

      <TabsContent value="formatConverter">
        <FormatConverter />
      </TabsContent>
    </Tabs>
  );
}
