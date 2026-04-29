"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Upload, Video, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { NIGERIA_STATES } from "@/lib/nigeria-states";
import { PROPERTY_TYPES, PROPERTY_TYPE_LABEL, type Property } from "@/lib/types";
import { parseVideoUrl, videoLabel } from "@/components/video-embed";

type Mode = "create" | "edit";

export function PropertyForm({ mode, initial }: { mode: Mode; initial?: Property }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(initial?.image_urls ?? []);
  const [uploading, setUploading] = useState(false);
  const [features, setFeatures] = useState<string[]>(initial?.features ?? []);
  const [amenities, setAmenities] = useState<string[]>(initial?.amenities ?? []);
  const [featInput, setFeatInput] = useState("");
  const [amenInput, setAmenInput] = useState("");
  const [videos, setVideos] = useState<string[]>(initial?.video_urls ?? []);
  const [videoInput, setVideoInput] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState<string | null>(null);

  async function uploadFiles(files: FileList) {
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("property-images")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("property-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      setImages((curr) => [...curr, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function addVideo() {
    const url = videoInput.trim();
    if (!url || videos.includes(url)) { setVideoInput(""); return; }
    setVideos((curr) => [...curr, url]);
    setVideoInput("");
  }

  async function uploadVideoFile(file: File) {
    const MAX_MB = 100;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Video exceeds ${MAX_MB} MB limit. Please compress it first.`);
      return;
    }
    setUploadingVideo(true);
    setVideoUploadProgress(`Uploading ${file.name}…`);
    setError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("property-videos")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("property-videos").getPublicUrl(path);
      setVideos((curr) => [...curr, data.publicUrl]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video upload failed");
    } finally {
      setUploadingVideo(false);
      setVideoUploadProgress(null);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    const title = String(fd.get("title") ?? "").trim();
    const slug =
      mode === "edit" && initial
        ? initial.slug
        : slugify(String(fd.get("slug") ?? "") || title);

    const payload = {
      slug,
      title,
      description: String(fd.get("description") ?? "").trim(),
      price_ngn: Number(fd.get("price_ngn")),
      purpose: String(fd.get("purpose")) as Property["purpose"],
      status: String(fd.get("status")) as Property["status"],
      property_type: String(fd.get("property_type")) as Property["property_type"],
      state: String(fd.get("state") ?? "").trim(),
      city: String(fd.get("city") ?? "").trim(),
      address: (String(fd.get("address") ?? "").trim() || null) as string | null,
      bedrooms: Number(fd.get("bedrooms") ?? 0),
      bathrooms: Number(fd.get("bathrooms") ?? 0),
      toilets: Number(fd.get("toilets") ?? 0),
      area_sqm: fd.get("area_sqm") ? Number(fd.get("area_sqm")) : null,
      plot_size_sqm: fd.get("plot_size_sqm") ? Number(fd.get("plot_size_sqm")) : null,
      parking_spaces: Number(fd.get("parking_spaces") ?? 0),
      year_built: fd.get("year_built") ? Number(fd.get("year_built")) : null,
      is_featured: fd.get("is_featured") === "on",
      features,
      amenities,
      image_urls: images,
      video_urls: videos,
      cover_image_url: images[0] ?? null,
    };

    start(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (mode === "create") {
        const { error } = await supabase.from("properties").insert({
          ...payload,
          created_by: user?.id ?? null,
          published_at: payload.status === "available" ? new Date().toISOString() : null,
        });
        if (error) return setError(error.message);
        router.push("/admin/properties");
        router.refresh();
      } else if (initial) {
        const { error } = await supabase.from("properties").update(payload).eq("id", initial.id);
        if (error) return setError(error.message);
        router.push("/admin/properties");
        router.refresh();
      }
    });
  }

  async function deleteProperty() {
    if (!initial) return;
    if (!confirm("Delete this property? This can't be undone.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("properties").delete().eq("id", initial.id);
    if (error) return setError(error.message);
    router.push("/admin/properties");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-3xl">
      {/* Basics */}
      <Section title="Basics">
        <Field label="Title">
          <Input name="title" required defaultValue={initial?.title} />
        </Field>
        {mode === "create" && (
          <Field label="Slug (URL)" hint="Leave blank to auto-generate from the title.">
            <Input name="slug" placeholder="auto-generated-from-title" />
          </Field>
        )}
        <Field label="Description">
          <Textarea name="description" rows={6} required defaultValue={initial?.description} />
        </Field>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Purpose">
            <Select name="purpose" defaultValue={initial?.purpose ?? "sale"}>
              <option value="sale">For sale</option>
              <option value="rent">For rent</option>
              <option value="shortlet">Shortlet</option>
            </Select>
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue={initial?.status ?? "available"}>
              <option value="draft">Draft</option>
              <option value="available">Available</option>
              <option value="under_offer">Under offer</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </Select>
          </Field>
          <Field label="Type">
            <Select name="property_type" defaultValue={initial?.property_type ?? "detached_house"}>
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{PROPERTY_TYPE_LABEL[t]}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Price (NGN)">
          <Input name="price_ngn" type="number" min={0} step="1000" required defaultValue={initial?.price_ngn} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_featured" defaultChecked={initial?.is_featured ?? false} className="h-4 w-4" />
          Show on homepage as a featured listing
        </label>
      </Section>

      {/* Location */}
      <Section title="Location">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="State">
            <Select name="state" required defaultValue={initial?.state ?? "Lagos"}>
              {NIGERIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="City / Area"><Input name="city" required defaultValue={initial?.city} /></Field>
        </div>
        <Field label="Address (optional)">
          <Input name="address" defaultValue={initial?.address ?? ""} />
        </Field>
      </Section>

      {/* Specs */}
      <Section title="Specifications">
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Bedrooms"><Input name="bedrooms" type="number" min={0} defaultValue={initial?.bedrooms ?? 0} /></Field>
          <Field label="Bathrooms"><Input name="bathrooms" type="number" min={0} defaultValue={initial?.bathrooms ?? 0} /></Field>
          <Field label="Toilets"><Input name="toilets" type="number" min={0} defaultValue={initial?.toilets ?? 0} /></Field>
          <Field label="Floor area (sqm)"><Input name="area_sqm" type="number" step="0.01" defaultValue={initial?.area_sqm ?? ""} /></Field>
          <Field label="Plot size (sqm)"><Input name="plot_size_sqm" type="number" step="0.01" defaultValue={initial?.plot_size_sqm ?? ""} /></Field>
          <Field label="Parking spaces"><Input name="parking_spaces" type="number" min={0} defaultValue={initial?.parking_spaces ?? 0} /></Field>
          <Field label="Year built"><Input name="year_built" type="number" min={1900} max={2100} defaultValue={initial?.year_built ?? ""} /></Field>
        </div>
      </Section>

      {/* Tags */}
      <Section title="Features & amenities">
        <TagInput
          label="Features"
          tags={features}
          setTags={setFeatures}
          input={featInput}
          setInput={setFeatInput}
          placeholder="e.g. Smart home, CCTV, BQ"
        />
        <TagInput
          label="Amenities"
          tags={amenities}
          setTags={setAmenities}
          input={amenInput}
          setInput={setAmenInput}
          placeholder="e.g. Pool, Gym, 24/7 power"
        />
      </Section>

      {/* Images */}
      <Section title="Images">
        <div>
          <Label htmlFor="files">Upload (the first image is used as the cover)</Label>
          <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-input p-8 text-sm text-muted-foreground hover:border-primary">
            <Upload className="h-4 w-4" />
            <span>{uploading ? "Uploading…" : "Click to choose images"}</span>
            <input
              id="files"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && uploadFiles(e.target.files)}
            />
          </label>
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((url, i) => (
              <div key={url} className="relative group aspect-square rounded-md overflow-hidden border bg-muted">
                <Image src={url} alt="" fill className="object-cover" sizes="200px" />
                {i === 0 && <span className="absolute top-1 left-1 rounded bg-black/60 text-white text-[10px] px-1.5 py-0.5">Cover</span>}
                <button
                  type="button"
                  onClick={() => setImages((curr) => curr.filter((u) => u !== url))}
                  className="absolute top-1 right-1 grid place-items-center h-6 w-6 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Videos */}
      <Section title="Videos">
        {/* — Upload — */}
        <div>
          <Label htmlFor="video-upload">Upload video file</Label>
          <label
            htmlFor="video-upload"
            className={`mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-input p-8 text-sm text-muted-foreground transition hover:border-primary ${uploadingVideo ? "opacity-60 pointer-events-none" : ""}`}
          >
            <Video className="h-6 w-6" />
            {uploadingVideo ? (
              <span>{videoUploadProgress}</span>
            ) : (
              <>
                <span className="font-medium">Click to choose a video</span>
                <span className="text-xs">.mp4 · .mov · .webm — max 100 MB</span>
              </>
            )}
            <input
              id="video-upload"
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.mov,.webm"
              className="hidden"
              disabled={uploadingVideo}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadVideoFile(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {/* — Divider — */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 border-t" />
          or add by URL
          <div className="flex-1 border-t" />
        </div>

        {/* — URL fallback — */}
        <Field hint="YouTube, Vimeo, or a direct video link">
          <div className="flex gap-2">
            <Input
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addVideo(); }
              }}
              placeholder="https://youtube.com/watch?v=… or https://vimeo.com/…"
            />
            <Button type="button" variant="outline" onClick={addVideo}>
              Add
            </Button>
          </div>
        </Field>

        {/* — Video list — */}
        {videos.length > 0 && (
          <div className="space-y-2">
            {videos.map((url) => {
              const parsed = parseVideoUrl(url);
              return (
                <div
                  key={url}
                  className="flex items-center gap-3 rounded-lg border bg-secondary/30 px-3 py-2 text-sm"
                >
                  {parsed ? (
                    <PlayCircle className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs">
                      {parsed ? videoLabel(url) : "Unknown format"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{url}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVideos((curr) => curr.filter((v) => v !== url))}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    aria-label="Remove video"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {error && <div className="text-sm text-destructive">{error}</div>}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? "Create property" : "Save changes"}
        </Button>
        {mode === "edit" && (
          <Button type="button" variant="destructive" onClick={deleteProperty}>Delete</Button>
        )}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-6 space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, hint, children }: { label?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <div className={label ? "mt-1.5" : ""}>{children}</div>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function TagInput({
  label,
  tags,
  setTags,
  input,
  setInput,
  placeholder,
}: {
  label: string;
  tags: string[];
  setTags: (v: string[]) => void;
  input: string;
  setInput: (v: string) => void;
  placeholder: string;
}) {
  function add() {
    const v = input.trim();
    if (!v) return;
    if (tags.includes(v)) return setInput("");
    setTags([...tags, v]);
    setInput("");
  }
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
        />
        <Button type="button" variant="outline" onClick={add}>Add</Button>
      </div>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs">
              {t}
              <button
                type="button"
                onClick={() => setTags(tags.filter((x) => x !== t))}
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Remove ${t}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
