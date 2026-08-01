import { describe, expect, it } from "vitest";

import { ROUTES, absoluteUrl, handballNetTeamUrl, newsPath, pagePath, teamPath } from "@/lib/paths";

describe("ROUTES", () => {
  it("matches the routing table from the architecture handoff", () => {
    expect(ROUTES).toEqual({
      home: "/",
      news: "/news",
      teams: "/mannschaften",
      schedule: "/spieluebersicht",
      sponsors: "/sponsoren",
      search: "/suche",
    });
  });
});

describe("newsPath", () => {
  it("builds /news/[slug]", () => {
    expect(newsPath("saisonstart-2026")).toBe("/news/saisonstart-2026");
  });

  it("stays under the news route constant", () => {
    expect(newsPath("x").startsWith(`${ROUTES.news}/`)).toBe(true);
  });
});

describe("teamPath", () => {
  it("builds /mannschaften/[slug]", () => {
    expect(teamPath("herren")).toBe("/mannschaften/herren");
    expect(teamPath("maennliche-a-jugend")).toBe("/mannschaften/maennliche-a-jugend");
  });
});

describe("pagePath", () => {
  it("maps the home page to the root", () => {
    expect(pagePath("home")).toBe("/");
  });

  it("maps every other page to /[slug]", () => {
    expect(pagePath("impressum")).toBe("/impressum");
    expect(pagePath("ueber-den-verein")).toBe("/ueber-den-verein");
  });
});

describe("handballNetTeamUrl", () => {
  it("defaults to the table view", () => {
    expect(handballNetTeamUrl("handball4all.baden.570")).toBe(
      "https://www.handball.net/mannschaften/handball4all.baden.570/tabelle",
    );
  });

  it("can point at the fixture list", () => {
    expect(handballNetTeamUrl("team-123", "spielplan")).toBe(
      "https://www.handball.net/mannschaften/team-123/spielplan",
    );
  });
});

describe("absoluteUrl", () => {
  it("joins a path onto the base URL", () => {
    expect(absoluteUrl("/news", "https://etsv-lauda.de")).toBe("https://etsv-lauda.de/news");
  });

  it("keeps a trailing-slash base from doubling up", () => {
    expect(absoluteUrl("/news/foo", "https://etsv-lauda.de/")).toBe(
      "https://etsv-lauda.de/news/foo",
    );
  });

  it("works with the local dev base", () => {
    expect(absoluteUrl(newsPath("test"), "http://localhost:3000")).toBe(
      "http://localhost:3000/news/test",
    );
  });

  it("resolves the root path", () => {
    expect(absoluteUrl(ROUTES.home, "https://etsv-lauda.de")).toBe("https://etsv-lauda.de/");
  });
});
