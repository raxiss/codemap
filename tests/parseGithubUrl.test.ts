import { describe, it, expect } from "vitest";
import { parseGithubUrl } from "@/lib/ingest/parseGithubUrl";

describe("parseGithubUrl", () => {
  it("parses standard https repo url", () => {
    const res = parseGithubUrl("https://github.com/facebook/react");
    expect(res).toEqual({
      owner: "facebook",
      repo: "react",
      branch: "main",
      subdir: "",
    });
  });

  it("parses url without protocol", () => {
    const res = parseGithubUrl("github.com/expressjs/express");
    expect(res).toEqual({
      owner: "expressjs",
      repo: "express",
      branch: "main",
      subdir: "",
    });
  });

  it("parses url with branch", () => {
    const res = parseGithubUrl("https://github.com/vercel/next.js/tree/canary");
    expect(res).toEqual({
      owner: "vercel",
      repo: "next.js",
      branch: "canary",
      subdir: "",
    });
  });

  it("parses url with branch and subdirectory", () => {
    const res = parseGithubUrl("https://github.com/owner/repo/tree/master/packages/core");
    expect(res).toEqual({
      owner: "owner",
      repo: "repo",
      branch: "master",
      subdir: "packages/core",
    });
  });

  it("strips .git extension", () => {
    const res = parseGithubUrl("https://github.com/owner/repo.git");
    expect(res?.repo).toBe("repo");
  });

  it("rejects non-github hosts", () => {
    expect(parseGithubUrl("https://gitlab.com/owner/repo")).toBeNull();
    expect(parseGithubUrl("https://bitbucket.org/owner/repo")).toBeNull();
  });

  it("rejects invalid URLs", () => {
    expect(parseGithubUrl("")).toBeNull();
    expect(parseGithubUrl("not a url")).toBeNull();
    expect(parseGithubUrl("https://github.com/")).toBeNull();
    expect(parseGithubUrl("https://github.com/owner")).toBeNull();
  });
});
