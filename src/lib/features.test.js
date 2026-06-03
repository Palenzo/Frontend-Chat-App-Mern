import { describe, it, expect } from "vitest";
import { fileFormat, transformImage } from "./features";

describe("fileFormat", () => {
  it("classifies video extensions", () => {
    expect(fileFormat("clip.mp4")).toBe("video");
    expect(fileFormat("clip.webm")).toBe("video");
    expect(fileFormat("clip.ogg")).toBe("video");
  });

  it("classifies audio extensions", () => {
    expect(fileFormat("song.mp3")).toBe("audio");
    expect(fileFormat("song.wav")).toBe("audio");
  });

  it("classifies image extensions", () => {
    expect(fileFormat("pic.png")).toBe("image");
    expect(fileFormat("pic.JPG".toLowerCase())).toBe("image");
    expect(fileFormat("pic.jpeg")).toBe("image");
    expect(fileFormat("pic.gif")).toBe("image");
  });

  it("falls back to file for unknown extensions", () => {
    expect(fileFormat("doc.pdf")).toBe("file");
    expect(fileFormat("archive.zip")).toBe("file");
  });
});

describe("transformImage", () => {
  it("injects a Cloudinary width transform after upload/", () => {
    const url =
      "https://res.cloudinary.com/demo/image/upload/v1710/sample.png";
    expect(transformImage(url, 200)).toBe(
      "https://res.cloudinary.com/demo/image/upload/dpr_auto/w_200/v1710/sample.png"
    );
  });

  it("defaults to width 100", () => {
    expect(transformImage("a/upload/x.png")).toContain("w_100");
  });
});
