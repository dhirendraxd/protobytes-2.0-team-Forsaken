import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Upload,
  Mic,
  Calendar,
  Save,
  Send,
  Volume2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BriefingEditorProps {
  onSave?: (data: any) => void;
  onPublish?: (data: any) => void;
}

const BriefingEditor = ({ onSave, onPublish }: BriefingEditorProps) => {
  const [inputMode, setInputMode] = useState<"text" | "upload" | "tts">("text");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [scriptText, setScriptText] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [publishDate, setPublishDate] = useState("");
  const [region, setRegion] = useState("");

  const categories = [
    "Safety Updates",
    "Market Prices",
    "Community Notices",
    "Transport Updates",
    "Agriculture Tips",
  ];

  const regions = ["Region A", "Region B", "Region C", "All Regions"];

  const handleSaveDraft = () => {
    const data = {
      title,
      category,
      scriptText,
      audioFile,
      publishDate,
      region,
      status: "draft",
    };
    onSave?.(data);
  };

  const handlePublish = () => {
    const data = {
      title,
      category,
      scriptText,
      audioFile,
      publishDate,
      region,
      status: "published",
    };
    onPublish?.(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Create Weekly Briefing
          </h2>
          <p className="text-muted-foreground">
            Draft content for IVR playback
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleSaveDraft} variant="outline" className="gap-2">
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          <Button onClick={handlePublish} className="gap-2">
            <Send className="w-4 h-4" />
            Publish
          </Button>
        </div>
      </div>

      {/* Main Form */}
      <Card className="p-6 border border-border/50 backdrop-blur-sm bg-card/50">
        <div className="space-y-6">
          {/* Title & Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Briefing Title</Label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Weekly Agriculture Update"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Target Region</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((reg) => (
                    <SelectItem key={reg} value={reg}>
                      {reg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishDate">Publish Date</Label>
              <input
                id="publishDate"
                type="datetime-local"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Content Input Tabs */}
          <div className="space-y-4">
            <Label>Content Input Method</Label>
            <Tabs value={inputMode} onValueChange={(v: any) => setInputMode(v)}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="text" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Text Script
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Audio
                </TabsTrigger>
                <TabsTrigger value="tts" className="gap-2">
                  <Volume2 className="w-4 h-4" />
                  Text-to-Speech
                </TabsTrigger>
              </TabsList>

              {/* Text Script Tab */}
              <TabsContent value="text" className="mt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="scriptText">Script Content</Label>
                    <span className="text-sm text-muted-foreground">
                      {scriptText.length} characters
                    </span>
                  </div>
                  <textarea
                    id="scriptText"
                    value={scriptText}
                    onChange={(e) => setScriptText(e.target.value)}
                    placeholder="Type your briefing script here. This text will be read by the IVR system..."
                    rows={12}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    Write clearly and concisely. Estimated reading time:{" "}
                    {Math.ceil(scriptText.split(" ").length / 150)} minute(s)
                  </p>
                </div>
              </TabsContent>

              {/* Upload Audio Tab */}
              <TabsContent value="upload" className="mt-4">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-foreground font-medium mb-2">
                      Upload Pre-recorded Audio
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Supported formats: MP3, WAV, OGG
                    </p>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) =>
                        setAudioFile(e.target.files?.[0] || null)
                      }
                      className="hidden"
                      id="audio-upload"
                    />
                    <label htmlFor="audio-upload">
                      <Button asChild variant="outline">
                        <span>Choose File</span>
                      </Button>
                    </label>
                    {audioFile && (
                      <p className="text-sm text-foreground mt-4">
                        Selected: {audioFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Text-to-Speech Tab */}
              <TabsContent value="tts" className="mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ttsText">Text for TTS Conversion</Label>
                    <textarea
                      id="ttsText"
                      value={scriptText}
                      onChange={(e) => setScriptText(e.target.value)}
                      placeholder="Type text to convert to speech..."
                      rows={12}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Voice</Label>
                      <Select defaultValue="female-1">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="female-1">Female Voice 1</SelectItem>
                          <SelectItem value="male-1">Male Voice 1</SelectItem>
                          <SelectItem value="female-2">Female Voice 2</SelectItem>
                          <SelectItem value="male-2">Male Voice 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ne">Nepali</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full gap-2">
                    <Mic className="w-4 h-4" />
                    Preview TTS Audio
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Card>

      {/* Preview Section */}
      <Card className="p-6 border border-border/50 backdrop-blur-sm bg-card/50">
        <h3 className="text-lg font-bold text-foreground mb-4">
          Briefing Preview
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center pb-3 border-b border-border/50">
            <span className="text-muted-foreground">Title:</span>
            <span className="text-foreground font-medium">
              {title || "Untitled"}
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-border/50">
            <span className="text-muted-foreground">Category:</span>
            <span className="text-foreground font-medium">
              {category || "Not set"}
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-border/50">
            <span className="text-muted-foreground">Region:</span>
            <span className="text-foreground font-medium">
              {region || "Not set"}
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-border/50">
            <span className="text-muted-foreground">Publish Date:</span>
            <span className="text-foreground font-medium">
              {publishDate
                ? new Date(publishDate).toLocaleString()
                : "Not scheduled"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status:</span>
            <span className="text-yellow-600 font-medium">Draft</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BriefingEditor;
