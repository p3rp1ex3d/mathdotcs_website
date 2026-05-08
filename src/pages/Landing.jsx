    import {
    useEffect,
    useRef,
    useState,
    forwardRef,
    } from "react";

    import HTMLFlipBook from "react-pageflip";

    import { Link } from "react-router-dom";

    import {
    ArrowRight,
    ArrowLeft,
    BookOpen,
    Sparkles,
    FileText,
    Compass,
    } from "lucide-react";

    import { FaYoutube } from "react-icons/fa";

    import {
    fetchBlogPosts,
    fetchYouTubeVideos,
    } from "../lib/github";

    const Page = forwardRef(function Page(
    {
        side = "right",
        number,
        children,
        className = "",
        style,
        isMobile = false,
    },
    ref,
    ) {
    return (
        <div
        ref={ref}
        className={`
            book-page
            grain
            corner-fold
        `}
        style={{
            background:
            document.documentElement.classList.contains(
                "dark",
            )
                ? "linear-gradient(135deg, #18181b 0%, #111114 100%)"
                : "linear-gradient(135deg, hsl(var(--paper)) 0%, hsl(var(--paper-2)) 100%)",

            boxShadow:
            document.documentElement.classList.contains(
                "dark",
            )
                ? "0 12px 40px rgba(0,0,0,0.45)"
                : "0 10px 30px rgba(0,0,0,0.12)",

            border:
            document.documentElement.classList.contains(
                "dark",
            )
                ? "1px solid rgba(255,255,255,0.06)"
                : "1px solid rgba(0,0,0,0.08)",

            borderRadius: isMobile
            ? "18px"
            : "10px",

            overflow: "hidden",

            ...style,
        }}
        >
        <div
            className={`
            book-page-inner
            ${isMobile ? "px-4 py-5" : ""}
            `}
        >
            {children}
        </div>

        {number != null && (
            <span
            className={`page-number ${
                side === "left"
                ? "page-number-left"
                : "page-number-right"
            }`}
            >
            — {number} —
            </span>
        )}
        </div>
    );
    });

    const CoverPage = forwardRef(
    function CoverPage(
    { isMobile },
    ref,
    ) {
        return (
        <div
            ref={ref}
            className="book-page grain cursor-pointer"
            style={{
            background:
                "linear-gradient(135deg, hsl(var(--paper)) 0%, hsl(var(--paper-2)) 100%)",
            borderRadius: "18px",
            overflow: "hidden",
            }}
        >
            <div className="book-page-inner items-center justify-center text-center">
            <div className="absolute top-6 left-6 sketch-circle text-base">
                ★
            </div>

            <div
                className="absolute top-6 right-6 chip"
                style={{
                borderColor:
                    "hsl(var(--ink))",
                }}
            >
                Vol. I
            </div>

            <BookOpen
                size={68}
                strokeWidth={2}
                className="mb-4 text-[hsl(var(--accent))]"
            />

            <h1
                className="text-5xl sm:text-6xl font-bold leading-none"
                style={{
                fontFamily:
                    "Patrick Hand, cursive",
                }}
            >
                <span className="hand-underline">
                MathDotCS
                </span>
            </h1>

            <p
                className="mt-4 text-xl sm:text-2xl text-[hsl(var(--ink-soft))]"
                style={{
                fontFamily:
                    "Caveat, cursive",
                }}
            >
                Decoding the universe,
                <br />
                one scribble at a time.
            </p>

            <div className="squiggle w-40 mt-6" />

            <p className="mt-8 text-sm text-[hsl(var(--ink-soft))] max-w-xs">
                Mathematics. Science.
                Technology.
                <br />A field notebook of
                curiosities.
            </p>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs flex items-center gap-1 text-[hsl(var(--ink-soft))] flip-hint">
                <span
                style={{
                    fontFamily:
                    "Caveat, cursive",
                }}
                >
                flip the page
                </span>

                <ArrowRight size={14} />
            </div>
            </div>
        </div>
        );
    },
    );

    const TOCPage = forwardRef(
    function TOCPage(
        { goToPage, isMobile },
        ref,
    ) {
        return (
        <Page
            ref={ref}
            isMobile={isMobile}
            number={1}
            side="left"
        >
            <h2
            className="text-3xl font-bold mb-1"
            style={{
                fontFamily:
                "Patrick Hand, cursive",
            }}
            >
            <span className="hand-underline">
                Table of Contents
            </span>
            </h2>

            <p
            className="text-sm text-[hsl(var(--ink-soft))] mb-6"
            style={{
                fontFamily:
                "Caveat, cursive",
            }}
            >
            Where would you like to
            look first?
            </p>

            <ul className="space-y-3 stagger">
            {[
  {
    n: "01",
    label: "An invitation",
    page: 1,
    icon: Sparkles,
  },
  {
    n: "02",
    label: "Featured scribbles",
    page: 1,
    icon: FileText,
  },
  {
    n: "03",
    label: "Latest videos",
    page: 3,
    icon: FaYoutube,
  },
  {
    n: "04",
    label: "Choose your path",
    page: 3,
    icon: Compass,
  },
].map(
                ({
                n,
                label,
                page,
                icon: Icon,
                }) => (
                <li key={n}>
  <button
    onClick={() => goToPage(page)}
    className="
      w-full
      flex
      items-center
      gap-3
      p-2
      rounded-xl
      hover:bg-[hsl(var(--ink))/0.05]
      transition-all
      text-left
    "
  >
  <span className="sketch-circle text-sm min-w-[2.2rem] h-[2.2rem]">
    {n}
  </span>

  <Icon
    size={20}
    className="text-[hsl(var(--accent))]"
  />

  <span
    className="text-lg flex-1"
    style={{
      fontFamily:
        "Patrick Hand, cursive",
    }}
  >
    {label}
  </span>
  </button>
</li>
                ),
            )}
            </ul>
        </Page>
        );
    },
    );

    const InvitationPage = forwardRef(
    function InvitationPage({ isMobile }, ref) {
        return (
        <Page
            ref={ref}
            isMobile={isMobile}
            number={2}
            side="right"
        >
            <span className="chip self-start mb-4">
            Chapter One
            </span>

            <h2
            className="text-3xl font-bold mb-3"
            style={{
                fontFamily:
                "Patrick Hand, cursive",
            }}
            >
            An{" "}
            <span className="marker">
                invitation
            </span>{" "}
            to wonder.
            </h2>

            <div
            className="text-base leading-relaxed space-y-4"
            style={{
                fontFamily:
                "Comic Neue, sans-serif",
            }}
            >
            <p>
                Hello, fellow traveler.
                This is a field notebook
                for ideas at the seam of
                mathematics, science,
                and computing.
            </p>

            <p>
                Some pages are blogs.
                Others are videos.
                None of them are
                homework.
            </p>

            <p
                style={{
                fontFamily:
                    "Caveat, cursive",
                }}
                className="text-2xl text-[hsl(var(--accent))]"
            >
                Curiosity is the only
                prerequisite.
            </p>
            </div>
        </Page>
        );
    },
    );

    const FeaturedBlogsPage = forwardRef(
    function FeaturedBlogsPage(
        {
        blogs = [],
        isMobile,
    },
        ref,
    ) {
        const featured =
        blogs.slice(0, 3);

        return (
        <Page
            ref={ref}
            isMobile={isMobile}
            number={3}
            side="left"
        >
            <span className="chip self-start mb-4">
            Chapter Two
            </span>

            <h2
            className="text-3xl font-bold mb-4"
            style={{
                fontFamily:
                "Patrick Hand, cursive",
            }}
            >
            Featured{" "}
            <span className="hand-underline">
                scribbles
            </span>
            </h2>

           <ul
  className={`
    space-y-3
    flex-1
    pb-16
    ${
      isMobile
        ? "overflow-y-auto pr-1"
        : "overflow-hidden"
    }
  `}
>
            {featured.map((b) => (
                <li key={b.slug}>
                <Link
                    to={`/blogs/${b.slug}`}
                    className="flex gap-3 p-2 border-2 border-[hsl(var(--ink))/0.4] hover:border-[hsl(var(--ink))] transition-all"
                    style={{
                    borderRadius:
                        "22px 14px 24px 16px / 14px 22px 16px 24px",
                    }}
                >
                    <div className="relative w-24 h-20 flex-shrink-0 overflow-hidden border-2 border-[hsl(var(--ink))] rounded-xl">
                    <img
                        src={b.cover}
                        alt={b.title}
                        className="w-full h-full object-cover"
                    />

                    <span className="absolute bottom-0.5 right-0.5 text-[10px] bg-[hsl(var(--ink))] text-[hsl(var(--paper))] px-1 rounded">
                        {b.readTime}
                    </span>
                    </div>

                    <div className="flex-1 min-w-0">
                    <h3
                        className="text-base font-bold line-clamp-2"
                        style={{
                        fontFamily:
                            "Patrick Hand, cursive",
                        }}
                    >
                        {b.title}
                    </h3>

                    <p
                        className="text-xs text-[hsl(var(--ink-soft))] line-clamp-3 mt-1"
                        style={{
                        fontFamily:
                            "Comic Neue, sans-serif",
                        }}
                    >
                        {b.excerpt}
                    </p>
                    </div>
                </Link>
                </li>
            ))}
            </ul>

            <Link
            to="/blogs"
            
            className="sketch-btn self-start mt-4"
            >
            See all blogs{" "}
            <ArrowRight size={16} />
            </Link>
        </Page>
        );
    },
    );

    const FeaturedVideosPage = forwardRef(
    function FeaturedVideosPage(
    {
        videos = [],
        isMobile,
    },
    ref,
    ) {
        const featured =
        videos.slice(0, 3);

        return (
        <Page
            ref={ref}
            isMobile={isMobile}
            number={4}
            side="right"
        >
            <span className="chip self-start mb-4">
            Chapter Three
            </span>

            <h2
            className="text-3xl font-bold mb-4"
            style={{
                fontFamily:
                "Patrick Hand, cursive",
            }}
            >
            Latest{" "}
            <span className="marker">
                videos
            </span>
            </h2>

            <ul
  className={`
    space-y-3
    flex-1
    pb-16
    ${
      isMobile
        ? "overflow-y-auto pr-1"
        : "overflow-hidden"
    }
  `}
>
            {featured.map((v) => (
                <li key={v.id}>
                <Link
                    to="/videos"
                    className="flex gap-3 p-2 border-2 border-[hsl(var(--ink))/0.4] hover:border-[hsl(var(--ink))] transition-all"
                    style={{
                    borderRadius:
                        "22px 14px 24px 16px / 14px 22px 16px 24px",
                    }}
                >
                    <div className="relative w-24 h-20 flex-shrink-0 overflow-hidden border-2 border-[hsl(var(--ink))] rounded-xl">
                    <img
                        src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
                        alt={v.title}
                        className="w-full h-full object-cover"
                    />

                    <span className="absolute bottom-0.5 right-0.5 text-[10px] bg-[hsl(var(--ink))] text-[hsl(var(--paper))] px-1 rounded">
                        {v.duration}
                    </span>
                    </div>

                    <div className="flex-1 min-w-0">
                    <h3
                        className="text-base font-bold line-clamp-2"
                        style={{
                        fontFamily:
                            "Patrick Hand, cursive",
                        }}
                    >
                        {v.title}
                    </h3>

                    <p
                        className="text-xs text-[hsl(var(--ink-soft))] line-clamp-3 mt-1"
                        style={{
                        fontFamily:
                            "Comic Neue, sans-serif",
                        }}
                    >
                        {v.description}
                    </p>
                    </div>
                </Link>
                </li>
            ))}
            </ul>

            <Link
            to="/videos"
            className="sketch-btn self-start mt-4"
            >
            Watch all videos{" "}
            <ArrowRight size={16} />
            </Link>
        </Page>
        );
    },
    );

    const NavigatePage = forwardRef(
    function NavigatePage(
    { isMobile },
    ref,
    ) {
        return (
        <Page
            ref={ref}
            isMobile={isMobile}
            number={5}
            side="left"
        >
            <span className="chip self-start mb-4">
            Chapter Four
            </span>

            <h2
            className="text-3xl font-bold mb-3"
            style={{
                fontFamily:
                "Patrick Hand, cursive",
            }}
            >
            Choose your{" "}
            <span className="hand-underline">
                path
            </span>
            </h2>

            <div className="grid gap-4">
            <Link
                to="/blogs"
                className="sketch-card p-5 flex items-center gap-4"
            >
                <FileText
                size={32}
                className="text-[hsl(var(--accent))]"
                />

                <div className="flex-1">
                <h3
                    className="text-xl font-bold"
                    style={{
                    fontFamily:
                        "Patrick Hand, cursive",
                    }}
                >
                    Read the blogs
                </h3>

                <p className="text-sm text-[hsl(var(--ink-soft))]">
                    Blogs &
                    deep dives.
                </p>
                </div>

                <ArrowRight />
            </Link>

            <Link
                to="/videos"
                className="sketch-card p-5 flex items-center gap-4"
            >
                <FaYoutube
                size={32}
                className="text-[hsl(var(--accent))]"
                />

                <div className="flex-1">
                <h3
                    className="text-xl font-bold"
                    style={{
                    fontFamily:
                        "Patrick Hand, cursive",
                    }}
                >
                    Watch the videos
                </h3>

                <p className="text-sm text-[hsl(var(--ink-soft))]">
                    Animated
                    explanations.
                </p>
                </div>

                <ArrowRight />
            </Link>
            </div>
        </Page>
        );
    },
    );

    const ClosingPage = forwardRef(
    function ClosingPage(
    { isMobile },
    ref,
    ) {
        return (
        <Page
            ref={ref}
            isMobile={isMobile}
            number={6}
            side="right"
        >
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <h2
                className="text-5xl mt-4 leading-tight"
                style={{
                fontFamily:
                    "Patrick Hand, cursive",
                }}
            >
                Until the next
                <br />
                <span className="marker">
                scribble.
                </span>
            </h2>

            <div className="squiggle w-32 mt-8 mb-8" />

            <p
                className="max-w-sm text-base text-[hsl(var(--ink-soft))]"
                style={{
                fontFamily:
                    "Comic Neue, sans-serif",
                }}
            >
                Questions rarely end.
                They simply turn the
                page into something new.
            </p>

            <div className="mt-10 text-sm opacity-70">
                ✦
            </div>
            </div>
        </Page>
        );
    },
    );

    export default function Landing() {
    const bookRef = useRef(null);

    const [size, setSize] =
        useState({
        w: 480,
        h: 640,
        });

    const [isMobile, setIsMobile] =
        useState(false);
    const [hasOpened, setHasOpened] = useState(false);

    const [remoteBlogs, setRemoteBlogs] =
        useState([]);

    const [
        remoteVideos,
        setRemoteVideos,
    ] = useState([]);

    useEffect(() => {
        fetchBlogPosts().then(
        (data) => {
            if (data?.length) {
            setRemoteBlogs(data);
            }
        },
        );

        fetchYouTubeVideos().then(
        (data) => {
            if (data?.length) {
            setRemoteVideos(data);
            }
        },
        );

        const update = () => {
        const w =
            window.innerWidth;

        const mobile =
            w < 900;

        setIsMobile(mobile);

        if (mobile) {
            const pageW =
            Math.min(
                w - 24,
                420,
            );

            setSize({
            w: pageW,
            h: Math.round(
                pageW * 1.35,
            ),
            });
        } else {
            const pageW =
            Math.min(
                Math.floor(
                (w - 120) / 2,
                ),
                520,
            );

            setSize({
            w: pageW,
            h: Math.round(
                pageW * 1.32,
            ),
            });
        }
        };

        update();

        window.addEventListener(
        "resize",
        update,
        );

        return () =>
        window.removeEventListener(
            "resize",
            update,
        );
    }, []);

    const goToPage = (n) =>
  bookRef.current
    ?.pageFlip()
    ?.turnToPage(n);

    const next = () =>
        bookRef.current
        ?.pageFlip()
        ?.flipNext();

    const prev = () =>
        bookRef.current
        ?.pageFlip()
        ?.flipPrev();

    return (
        <div className="relative z-10 flex flex-col items-center px-2 sm:px-4 pt-2 pb-8 min-h-[80vh] overflow-x-hidden">
        <p
            className="text-base text-[hsl(var(--ink-soft))] mb-3"
            style={{
            fontFamily:
                "Caveat, cursive",
            }}
        >
            ↓ click or drag a page
            corner to flip ↓
        </p>

        <div className="book-shell w-full flex justify-center overflow-visible px-2 sm:px-0">
            <HTMLFlipBook
            key={isMobile ? "mobile" : "desktop"}
            ref={bookRef}
            width={size.w}
            height={size.h}
            onFlip={() => setHasOpened(true)}
            size="fixed"
            maxShadowOpacity={0}
            
            showCover={!isMobile && hasOpened}
            mobileScrollSupport={
                true
            }
            drawShadow={!isMobile}
            flippingTime={750}
            usePortrait={isMobile}
            className={`book-flip ${
                isMobile
                ? "mobile-book"
                : ""
            }`}
            >
            <CoverPage isMobile={isMobile} />

    <TOCPage
    goToPage={goToPage}
    isMobile={isMobile}
    />

    <InvitationPage
    isMobile={isMobile}
    />

    <FeaturedBlogsPage
    blogs={remoteBlogs}
    isMobile={isMobile}
    />

    <FeaturedVideosPage
    videos={remoteVideos}
    isMobile={isMobile}
    />

    <NavigatePage
    isMobile={isMobile}
    />

    <ClosingPage
    isMobile={isMobile}
    />
            </HTMLFlipBook>
        </div>

        <div className="mt-6 flex items-center gap-3 flex-wrap justify-center">
            <button
            onClick={prev}
            className="sketch-btn"
            >
            <ArrowLeft size={16} />
            Prev
            </button>

            <span
            className="text-sm text-[hsl(var(--ink-soft))]"
            style={{
                fontFamily:
                "Caveat, cursive",
            }}
            >
            a small notebook of big
            ideas
            </span>

            <button
            onClick={next}
            className="sketch-btn sketch-btn-primary"
            >
            Next{" "}
            <ArrowRight size={16} />
            </button>
        </div>
        </div>
    );
    }