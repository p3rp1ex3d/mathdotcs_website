import sortingLabMarkdown from "../content/local-blogs/sorting-lab.md?raw";

const GITHUB_OWNER =
  import.meta.env.VITE_GITHUB_OWNER || "";

const GITHUB_REPO =
  import.meta.env.VITE_GITHUB_REPO || "";

const GITHUB_TOKEN =
  import.meta.env.VITE_GITHUB_TOKEN || "";

const GITHUB_BRANCH =
  import.meta.env.VITE_GITHUB_BRANCH ||
  "master";

function getHeaders() {
  const headers = {
    Accept:
      "application/vnd.github.v3+json",
  };

  if (GITHUB_TOKEN) {
    headers.Authorization = `token ${GITHUB_TOKEN}`;
  }

  return headers;
}

/* -------------------------------- */
/* Asset URL resolver               */
/* -------------------------------- */

async function resolveGitHubAsset(path, fetchFn = fetch) {
  if (!path) return "";

  const clean = path.replace(/^\/+/, "");

  try {
    const res = await fetchFn(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${clean}`,
      {
        headers: getHeaders(),
      }
    );

    if (!res.ok) {
      return "";
    }

    const data = await res.json();

    // GitHub API already returns base64 content
    const base64 = data.content.replace(/\n/g, "");

    const mime =
      data.name.endsWith(".png")
        ? "image/png"
        : data.name.endsWith(".jpg") ||
          data.name.endsWith(".jpeg")
        ? "image/jpeg"
        : "image/png";

    return `data:${mime};base64,${base64}`;
  } catch (err) {
    console.error(
      "Failed to resolve asset:",
      err
    );

    return "";
  }
}

/* -------------------------------- */
/* Frontmatter parser               */
/* -------------------------------- */

function parseFrontmatter(content) {
  const match = content.match(
    /^---\r?\n([\s\S]*?)\r?\n---/,
  );

  const frontmatter = match
    ? match[1]
    : "";

  const markdown = content.replace(
    /^---\r?\n[\s\S]*?\r?\n---\r?\n?/,
    "",
  );

  const metadata = {};

  frontmatter
    .split("\n")
    .forEach((line) => {
      const i = line.indexOf(":");

      if (i > -1) {
        const key = line
          .slice(0, i)
          .trim();

        const rawValue = line
          .slice(i + 1)
          .trim();

        let value = rawValue;

        if (key === "tags") {
          if (
            rawValue.startsWith(
              "[",
            ) &&
            rawValue.endsWith("]")
          ) {
            try {
              value =
                JSON.parse(
                  rawValue,
                );
            } catch {
              value = rawValue
                .slice(1, -1)
                .split(",")
                .map((item) =>
                  item.trim(),
                )
                .filter(Boolean);
            }
          } else {
            value = rawValue
              .split(",")
              .map((item) =>
                item.trim(),
              )
              .filter(Boolean);
          }
        }

        metadata[key] = value;
      }
    });

  return {
    metadata,
    content: markdown,
  };
}

function getLocalDevBlogPosts() {
  if (!import.meta.env.DEV) {
    return [];
  }

  try {
    const {
      metadata,
      content,
    } = parseFrontmatter(
      // sortingLabMarkdown,
    );

    return [
      {
        // slug:
        //   metadata.slug ||
        //   "sorting-lab",

        title:
          metadata.title ||
          "Untitled",

        category:
          metadata.category ||
          "General",

        date:
          metadata.date ||
          "",

        excerpt:
          metadata.excerpt ||
          "",

        cover:
          "/algo_intro.png",

        readTime:
          metadata.readTime ||
          "2 min read",

        author:
          metadata.author ||
          "",

        content,

        interactive:
          metadata.interactive ===
          "true",

        interactiveType:
          metadata.interactiveType ||
          null,
      },
    ];
  } catch (err) {
    console.warn(
      "Local dev blog fixture failed:",
      err,
    );

    return [];
  }
}

function mergeDevLocalPosts(
  remoteList,
) {
  if (
    !import.meta.env.DEV
  ) {
    return remoteList;
  }

  const local =
    getLocalDevBlogPosts();

  if (
    !local.length
  ) {
    return remoteList;
  }

  const map =
    new Map(
      remoteList.map(
        (p) =>
          [
            p.slug,

            p,
          ],
      ),
    );

  for (
    const p of local
  ) {
    map.set(
      p.slug,

      p,
    );
  }

  return Array.from(
    map.values(),
  ).sort(
    (
      a,

      b,
    ) =>
      new Date(
        b.date,
      ) -
      new Date(
        a.date,
      ),
  );
}

/* -------------------------------- */
/* Generic GitHub fetch             */
/* -------------------------------- */

async function fetchGitHubContent(
  path,
  fetchFn = fetch,
) {
  if (
    !GITHUB_OWNER ||
    !GITHUB_REPO
  ) {
    return null;
  }

  try {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;

    const res = await fetchFn(url, {
      headers: getHeaders(),
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error(
      "GitHub fetch failed:",
      err,
    );

    return null;
  }
}

/* -------------------------------- */
/* Blog posts                       */
/* -------------------------------- */

export async function fetchBlogPosts(
  fetchFn = fetch,
) {
  if (
    !GITHUB_OWNER ||
    !GITHUB_REPO
  ) {
    return mergeDevLocalPosts(
      [],
    );
  }

  try {
    const res = await fetchFn(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`,
      {
        headers: getHeaders(),
      },
    );

    if (!res.ok) {
      return mergeDevLocalPosts(
        [],
      );
    }

    const files = await res.json();

    const markdownFiles =
      files.filter(
        (f) =>
          f.type === "file" &&
          f.name.endsWith(".md") &&
          f.name.toLowerCase() !==
            "readme.md",
      );

    const posts = await Promise.all(
      markdownFiles.map(
        async (file) => {
          try {
            const fileRes =
              await fetchFn(
                file.url,
                {
                  headers:
                    getHeaders(),
                },
              );

            if (!fileRes.ok) {
              return null;
            }

            const fileData =
              await fileRes.json();

            const content = atob(
              fileData.content || "",
            );

            const {
              metadata,
              content: md,
            } =
              parseFrontmatter(
                content,
              );

            return {
              slug:
                file.name.replace(
                  /\.md$/,
                  "",
                ),

              title:
                metadata.title ||
                "Untitled",

              category:
                metadata.category ||
                "General",

              date:
                metadata.date ||
                "",

              excerpt:
                metadata.excerpt ||
                "",

              cover:
                await resolveGitHubAsset(
                metadata.cover || "",
                fetchFn
                ),

              readTime:
                metadata.readTime ||
                "2 min read",

              author:
                metadata.author ||
                "",

              content: md,

              interactive:
                metadata.interactive === "true",

                interactiveType:
                metadata.interactiveType || null,
            };
          } catch (err) {
            console.error(
              "Failed to parse post:",
              file.name,
              err,
            );

            return null;
          }
        },
      ),
    );

    const sorted =
      posts

        .filter(
          Boolean,
        )

        .sort(
          (
            a,

            b,

          ) =>
            new Date(
              b.date,
            ) -
            new Date(
              a.date,
            ),
        );

    return mergeDevLocalPosts(
      sorted,
    );
  } catch (err) {
    console.error(
      "Failed to fetch blog posts:",
      err,
    );

    return mergeDevLocalPosts(
      [],
    );
  }
}

/* -------------------------------- */
/* Single blog post                 */
/* -------------------------------- */

export async function fetchBlogPost(
  slug,
  fetchFn = fetch,
) {
  const posts =
    await fetchBlogPosts(
      fetchFn,
    );

  return (
    posts.find(
      (p) => p.slug === slug,
    ) || null
  );
}

/* -------------------------------- */
/* Related articles                 */
/* -------------------------------- */

export async function getRelatedArticles(
  slug,
  category,
  limit = 2,
  fetchFn = fetch,
) {
  const posts =
    await fetchBlogPosts(
      fetchFn,
    );

  return posts
    .filter(
      (p) =>
        p.category ===
          category &&
        p.slug !== slug,
    )
    .slice(0, limit);
}

/* -------------------------------- */
/* Latest posts                     */
/* -------------------------------- */

export async function getLatestPosts(
  limit = 4,
  fetchFn = fetch,
) {
  const posts =
    await fetchBlogPosts(
      fetchFn,
    );

  return posts.slice(0, limit);
}

/* -------------------------------- */
/* YouTube videos                   */
/* -------------------------------- */

export async function fetchYouTubeVideos(
  fetchFn = fetch,
) {
  if (
    !GITHUB_OWNER ||
    !GITHUB_REPO
  ) {
    return [];
  }

  try {
    const fileData =
      await fetchGitHubContent(
        "youtube_videos.json",
        fetchFn,
      );

    if (
      !fileData ||
      !fileData.content
    ) {
      return [];
    }

    const decoded = atob(
      fileData.content,
    );

    const videos =
      JSON.parse(decoded);

    return Array.isArray(videos)
      ? videos
      : [];
  } catch (err) {
    console.error(
      "Failed to fetch videos:",
      err,
    );

    return [];
  }
}