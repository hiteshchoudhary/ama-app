"use client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

function CopyToClipboard({ profileUrl }: { profileUrl: string }) {
  const { toast } = useToast();

  const handleCopy = (profileUrl: string) => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "URL Copied!",
      description: "Profile URL has been copied to clipboard.",
    });
  };

  return <Button onClick={() => handleCopy(profileUrl)}>Copy</Button>;
}

export default CopyToClipboard;
