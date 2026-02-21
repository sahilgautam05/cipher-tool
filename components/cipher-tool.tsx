'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, RotateCcw, Zap } from 'lucide-react';
import { encrypt, decrypt, bruteForce, findBestMatch } from '@/lib/cipher-utils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CipherTool() {
  const { toast } = useToast();

  // Encryption state
  const [plaintext, setPlaintext] = useState('');
  const [encryptShift, setEncryptShift] = useState(3);
  const [ciphertext, setCiphertext] = useState('');

  // Decryption state
  const [decryptCiphertext, setDecryptCiphertext] = useState('');
  const [decryptShift, setDecryptShift] = useState(3);
  const [decryptResult, setDecryptResult] = useState('');

  // Brute-force state
  const [bruteForceInput, setBruteForceInput] = useState('');
  const [bruteForceResults, setBruteForceResults] = useState<
    Array<{ shift: number; text: string; score?: number }>
  >([]);
  const [showBruteForceDialog, setShowBruteForceDialog] = useState(false);

  // Handle encryption with real-time preview
  const handleEncrypt = useCallback(() => {
    if (!plaintext.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter text to encrypt',
        variant: 'destructive',
      });
      return;
    }

    const shift = parseInt(String(encryptShift), 10);
    if (isNaN(shift)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid shift value',
        variant: 'destructive',
      });
      return;
    }

    const encrypted = encrypt(plaintext, shift);
    setCiphertext(encrypted);

    toast({
      title: 'Success',
      description: `Text encrypted with shift ${shift}`,
    });
  }, [plaintext, encryptShift, toast]);

  // Handle decryption with real-time preview
  const handleDecrypt = useCallback(() => {
    if (!decryptCiphertext.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter text to decrypt',
        variant: 'destructive',
      });
      return;
    }

    const shift = parseInt(String(decryptShift), 10);
    if (isNaN(shift)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid shift value',
        variant: 'destructive',
      });
      return;
    }

    const decrypted = decrypt(decryptCiphertext, shift);
    setDecryptResult(decrypted);

    toast({
      title: 'Success',
      description: `Text decrypted with shift ${shift}`,
    });
  }, [decryptCiphertext, decryptShift, toast]);

  // Handle brute-force attack
  const handleBruteForce = useCallback(() => {
    if (!bruteForceInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter text for brute-force',
        variant: 'destructive',
      });
      return;
    }

    const results = bruteForce(bruteForceInput);
    const resultsWithScores = results.map((result) => ({
      ...result,
      score: findBestMatch([result]).score,
    }));

    // Sort by score
    resultsWithScores.sort((a, b) => (b.score || 0) - (a.score || 0));

    setBruteForceResults(resultsWithScores);
    setShowBruteForceDialog(true);

    toast({
      title: 'Complete',
      description: 'Brute-force analysis complete. Check results below.',
    });
  }, [bruteForceInput, toast]);

  // Copy to clipboard helper
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied',
        description: `${label} copied to clipboard`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  // Download as text file
  const downloadAsFile = (text: string, filename: string) => {
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
    );
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: 'Downloaded',
      description: `${filename} downloaded successfully`,
    });
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Caesar Cipher Tool
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Encrypt, decrypt, and analyze Caesar Cipher messages with ease. 
            Perfect for learning cryptography and secure communication.
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="encrypt" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 bg-slate-800 border border-slate-700">
            <TabsTrigger value="encrypt">Encrypt</TabsTrigger>
            <TabsTrigger value="decrypt">Decrypt</TabsTrigger>
            <TabsTrigger value="bruteforce">Brute Force</TabsTrigger>
          </TabsList>

          {/* Encryption Tab */}
          <TabsContent value="encrypt" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Input Card */}
              <Card className="bg-slate-800 border-slate-700 p-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-200 mb-2 block">
                      Message to Encrypt
                    </Label>
                    <Textarea
                      placeholder="Enter your message here..."
                      value={plaintext}
                      onChange={(e) => setPlaintext(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 min-h-40"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-200 mb-2 block">
                      Shift Key (0-25)
                    </Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        min="-25"
                        max="25"
                        value={encryptShift}
                        onChange={(e) => setEncryptShift(parseInt(e.target.value, 10) || 0)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <span className="text-slate-400 text-sm min-w-fit">
                        (Shift: {((encryptShift % 26) + 26) % 26})
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleEncrypt}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      Encrypt
                    </Button>
                    <Button
                      onClick={() => setPlaintext('')}
                      variant="outline"
                      className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Output Card */}
              <Card className="bg-slate-800 border-slate-700 p-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-200 mb-2 block">
                      Encrypted Text
                    </Label>
                    <Textarea
                      placeholder="Your encrypted message will appear here..."
                      value={ciphertext}
                      readOnly
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 min-h-40"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(ciphertext, 'Encrypted text')}
                      variant="outline"
                      className="flex-1 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => downloadAsFile(ciphertext, 'encrypted.txt')}
                      variant="outline"
                      className="flex-1 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Decryption Tab */}
          <TabsContent value="decrypt" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Input Card */}
              <Card className="bg-slate-800 border-slate-700 p-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-200 mb-2 block">
                      Message to Decrypt
                    </Label>
                    <Textarea
                      placeholder="Enter your encrypted message here..."
                      value={decryptCiphertext}
                      onChange={(e) => setDecryptCiphertext(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 min-h-40"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-200 mb-2 block">
                      Shift Key (0-25)
                    </Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        min="-25"
                        max="25"
                        value={decryptShift}
                        onChange={(e) => setDecryptShift(parseInt(e.target.value, 10) || 0)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <span className="text-slate-400 text-sm min-w-fit">
                        (Shift: {((decryptShift % 26) + 26) % 26})
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleDecrypt}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Decrypt
                    </Button>
                    <Button
                      onClick={() => setDecryptCiphertext('')}
                      variant="outline"
                      className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Output Card */}
              <Card className="bg-slate-800 border-slate-700 p-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-200 mb-2 block">
                      Decrypted Text
                    </Label>
                    <Textarea
                      placeholder="Your decrypted message will appear here..."
                      value={decryptResult}
                      readOnly
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 min-h-40"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(decryptResult, 'Decrypted text')}
                      variant="outline"
                      className="flex-1 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => downloadAsFile(decryptResult, 'decrypted.txt')}
                      variant="outline"
                      className="flex-1 bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Brute Force Tab */}
          <TabsContent value="bruteforce" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-200 mb-2 block">
                    Ciphertext to Analyze
                  </Label>
                  <Textarea
                    placeholder="Enter encrypted text to analyze all possible decryptions..."
                    value={bruteForceInput}
                    onChange={(e) => setBruteForceInput(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 min-h-40"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleBruteForce}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Run Brute Force Attack
                  </Button>
                  <Button
                    onClick={() => setBruteForceInput('')}
                    variant="outline"
                    className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {bruteForceResults.length > 0 && (
                  <div className="mt-6 p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <p className="text-slate-300 mb-3">
                      Found <span className="font-bold text-cyan-400">{bruteForceResults.length}</span> possible decryptions
                    </p>
                    <Button
                      onClick={() => setShowBruteForceDialog(true)}
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      View All Results
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Brute Force Results Dialog */}
            <Dialog open={showBruteForceDialog} onOpenChange={setShowBruteForceDialog}>
              <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Brute Force Results</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    All possible decryptions sorted by likelihood of being English text
                  </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-96 pr-4">
                  <div className="space-y-3">
                    {bruteForceResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-700 rounded border border-slate-600 hover:border-slate-500 transition"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-cyan-400 font-mono font-bold">
                                Shift {result.shift}
                              </span>
                              {result.score !== undefined && (
                                <div className="flex items-center gap-1">
                                  <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                      style={{
                                        width: `${Math.min((result.score || 0) * 100, 100)}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-slate-400 text-xs">
                                    {((result.score || 0) * 100).toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="text-slate-200 break-words">
                              {result.text}
                            </p>
                          </div>
                          <Button
                            onClick={() => copyToClipboard(result.text, 'Result')}
                            size="sm"
                            variant="outline"
                            className="bg-slate-600 border-slate-500 text-slate-200 hover:bg-slate-500 flex-shrink-0"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Preview</h3>
            <p className="text-slate-400">See encrypted or decrypted results instantly as you type</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Brute Force Attack</h3>
            <p className="text-slate-400">Try all 25 possible shifts and auto-detect English text</p>
          </Card>
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Download & Share</h3>
            <p className="text-slate-400">Copy to clipboard or download results as text files</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
