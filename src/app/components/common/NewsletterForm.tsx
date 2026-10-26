import { useState } from "react";
import { toast } from "sonner";
import { services } from "../../../services";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "../ui/utils";

/** Real newsletter subscription via services.store.subscribe. */
export function NewsletterForm({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(v)) { toast.error("Please enter a valid email address."); return; }
    setBusy(true);
    try {
      const res = await services.store.subscribe(v);
      toast.success(res.already ? "You're already subscribed. Thanks!" : "Subscribed! Watch your inbox for new arrivals and offers.");
      setEmail("");
    } catch (err) {
      console.error("Newsletter subscribe failed:", err);
      toast.error("Couldn't subscribe right now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={cn("flex w-full gap-2", className)}>
      <label className="sr-only" htmlFor="newsletter-email">Email address</label>
      <Input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className={cn("h-11 bg-card", inverted && "border-transparent text-foreground")}
      />
      <Button type="submit" disabled={busy} className={cn("h-11 shrink-0", inverted && "bg-background text-foreground hover:bg-background/90")}>
        {busy ? "Subscribing…" : "Subscribe"}
      </Button>
    </form>
  );
}
