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

import { KeySquare, Puzzle, Shuffle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useUtilityInvoke } from "@/utilities/invoke";
import { InvokeFunction } from "@/utilities/types";

// Key Generator Component
function KeyGenerator() {
  const { data, trigger } = useUtilityInvoke(InvokeFunction.GenerateRsaKey);
  const [keyBitLength, setKeyBitLength] = useState<string>("2048");

  const onGenerateKeyPair = async () => {
    await trigger({
      bits: parseInt(keyBitLength),
    });
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
        <Button onClick={onGenerateKeyPair}>
          <KeySquare className="mr-2 h-4 w-4" /> 生成密钥对
        </Button>
        <div>
          <Label htmlFor="generatedPublicKey">公钥 (PEM)</Label>
          <Textarea
            id="generatedPublicKey"
            placeholder="生成的公钥将显示在此处"
            rows={6}
            readOnly
            value={data?.publicKey}
          />
        </div>
        <div>
          <Label htmlFor="generatedPrivateKey">私钥 (PEM)</Label>
          <Textarea
            id="generatedPrivateKey"
            placeholder="生成的私钥将显示在此处"
            rows={10}
            readOnly
            value={data?.privateKey}
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

      <TabsContent value="formatConverter">
        <FormatConverter />
      </TabsContent>
    </Tabs>
  );
}
