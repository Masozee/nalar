"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { PlusCircle, FileText, ChevronLeft, ChevronRight, Search, LayoutGrid, List as ListIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PublicationList } from "./publication-list";

interface Author {
  id: number;
  name: string;
  slug: string;
  position: string;
  organization: string;
  category: string;
  profile_url: string | null;
  profile_img: string | null;
}

interface Topic {
  id: number;
  name: string;
  slug: string;
}

interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
  background: string | null;
}

interface Publication {
  id: number;
  title: string;
  slug: string;
  date_publish: string;
  authors: Author[];
  topic: Topic[];
  category_info: CategoryInfo;
  image: string | null;
  file: string | null;
  description: string;
  viewed: number;
  download_count: number;
}

interface PublicationsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Publication[];
}

function CardView({ filtered, selected, toggleSelect, loading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
      {filtered && filtered.length > 0 ? (
        filtered.map((pub) => {
          const maxAvatars = 3;
          const shownAuthors = pub.authors.slice(0, maxAvatars);
          const extraCount = pub.authors.length - maxAvatars;
          return (
            <Card
              key={pub.id}
              className={"rounded-2xl shadow-lg hover:shadow-2xl transition-shadow border-0 bg-white/95 flex flex-col relative"}
            >
              {pub.image && (
                <img
                  src={pub.image}
                  alt={pub.title}
                  className="rounded-t-2xl w-full h-40 object-cover"
                  loading="lazy"
                />
              )}
              <CardContent className="flex-1 flex flex-col gap-3 p-5">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline" className="rounded-full bg-blue-50 text-blue-600 border-blue-200 px-3">
                    {pub.category_info?.name}
                  </Badge>
                  {pub.topic.map((t) => (
                    <Badge key={t.id} variant="outline" className="rounded-full bg-green-50 text-green-600 border-green-200 px-3">
                      {t.name}
                    </Badge>
                  ))}
                </div>
                <h3 className="font-semibold text-lg text-primary line-clamp-2 mb-1">
                  <Link href={`/publications/${pub.slug}`}>{pub.title}</Link>
                </h3>
                {/* Stacked Avatars for Authors */}
                <div className="flex items-center mb-2">
                  <div className="flex -space-x-3">
                    {shownAuthors.map((a, idx) => (
                      <img
                        key={a.id}
                        src={a.profile_img || "/default-avatar.png"}
                        alt={a.name}
                        className={`rounded-full h-8 w-8 object-cover border-2 border-white shadow ${idx === 0 ? "z-20" : idx === 1 ? "z-10" : "z-0"}`}
                        style={{ background: "#f3f4f6" }}
                      />
                    ))}
                    {extraCount > 0 && (
                      <span className="rounded-full h-8 w-8 flex items-center justify-center bg-gray-200 border-2 border-white text-xs font-semibold text-gray-600 shadow z-0">
                        +{extraCount}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  Published: {new Date(pub.date_publish).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  Views: {pub.viewed?.toLocaleString()} | Downloads: {pub.download_count?.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground line-clamp-3 mb-2" dangerouslySetInnerHTML={{ __html: pub.description }} />
                <div className="flex gap-2 mt-auto">
                  <Link href={pub.file ?? "#"} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="text-xs rounded-full">
                      Download PDF
                    </Button>
                  </Link>
                  <Link href={`/admin/publications/${pub.id}`}>
                    <Button size="sm" variant="default" className="text-xs rounded-full">
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <div className="col-span-full text-center text-muted-foreground py-12">No publications found.</div>
      )}
    </div>
  );
}

export default function PublicationsPage() {
  const [data, setData] = useState<PublicationsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pageUrl, setPageUrl] = useState(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/publications/?page_size=10`);

  useEffect(() => {
    setLoading(true);
    fetch(pageUrl)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, [pageUrl]);

  // (removed old search-based filtered block; only advanced filtering remains below)

  // --- Analytics ---
  const allPubs = data?.results || [];
  const totalCount = data?.count || 0;
  const totalViews = allPubs.reduce((sum, p) => sum + (p.viewed || 0), 0);
  const totalDownloads = allPubs.reduce((sum, p) => sum + (p.download_count || 0), 0);
  const authorCounts: Record<string, number> = {};
  allPubs.forEach((p) => p.authors.forEach((a) => { authorCounts[a.name] = (authorCounts[a.name] || 0) + 1; }));
  const topAuthors = Object.entries(authorCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // --- Filter state ---
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [topicFilter, setTopicFilter] = useState<string[]>([]);
  const [yearFilter, setYearFilter] = useState<string[]>([]);
  const [authorFilter, setAuthorFilter] = useState<string[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  // --- Filter options ---
  const categories = Array.from(new Set(allPubs.map((p) => p.category_info?.name).filter(Boolean)));
  const topics = Array.from(new Set(allPubs.flatMap((p) => p.topic.map((t) => t.name)).filter(Boolean)));
  const years = Array.from(new Set(allPubs.map((p) => p.date_publish?.slice(0, 4)).filter(Boolean))).sort((a, b) => b.localeCompare(a));
  const authors = Array.from(new Set(allPubs.flatMap((p) => p.authors.map((a) => a.name)).filter(Boolean)));

  // --- Advanced filtering ---
  const filtered = allPubs.filter((pub) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      pub.title.toLowerCase().includes(searchLower) ||
      pub.authors.some((a) => a.name.toLowerCase().includes(searchLower)) ||
      pub.topic.some((t) => t.name.toLowerCase().includes(searchLower)) ||
      pub.category_info?.name.toLowerCase().includes(searchLower);
    const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(pub.category_info?.name);
    const matchesTopic = topicFilter.length === 0 || pub.topic.some((t) => topicFilter.includes(t.name));
    const matchesYear = yearFilter.length === 0 || yearFilter.includes(pub.date_publish?.slice(0, 4));
    const matchesAuthor = authorFilter.length === 0 || pub.authors.some((a) => authorFilter.includes(a.name));
    return matchesSearch && matchesCategory && matchesTopic && matchesYear && matchesAuthor;
  });
// (No other `filtered` definition in this file!)

  // --- Bulk actions (only for list view) ---
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const allSelected = filtered.length > 0 && selected.length === filtered.length;
  const toggleSelectAll = () => {
    setSelected(allSelected ? [] : filtered.map((p) => p.id));
  };
  const toggleSelect = (id: number) => {
    setSelected((sel) => sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]);
  };
  const [bulkActionMsg, setBulkActionMsg] = useState<string>("");
  const handleBulkDelete = () => {
    setBulkActionMsg(`Deleted ${selected.length} publication(s) (simulated)`);
    setSelected([]);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 md:gap-8 md:p-8">
      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-2">
        <Card className="rounded-2xl bg-white/80 shadow-md flex flex-col items-center py-6 border-0">
          <span className="text-3xl font-bold text-primary">{totalCount}</span>
          <span className="text-xs text-muted-foreground mt-1">Total Publications</span>
        </Card>
        <Card className="rounded-2xl bg-white/80 shadow-md flex flex-col items-center py-6 border-0">
          <span className="text-3xl font-bold text-primary">{totalViews.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground mt-1">Total Views</span>
        </Card>
        <Card className="rounded-2xl bg-white/80 shadow-md flex flex-col items-center py-6 border-0">
          <span className="text-3xl font-bold text-primary">{totalDownloads.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground mt-1">Total Downloads</span>
        </Card>
        <Card className="rounded-2xl bg-white/80 shadow-md flex flex-col items-center py-6 border-0">
          <span className="text-xs text-muted-foreground mb-2">Top Authors</span>
          <div className="flex flex-col gap-1">
            {topAuthors.map(([name, count]) => (
              <span key={name} className="text-sm font-medium">{name} <span className="text-muted-foreground">({count})</span></span>
            ))}
          </div>
        </Card>
      </div>

      {/* Filters & View Toggle */}
      <Card className="mb-6 rounded-2xl bg-white/70 shadow-lg border-0">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5 text-primary" /> Publications
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Browse, search, and manage all publications.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={v => setViewMode(v as 'card' | 'list')}>
              <TabsList className="rounded-full bg-gray-100 p-1">
                <TabsTrigger value="card" className="rounded-full px-3 flex items-center gap-1 text-sm">
                  <LayoutGrid className="w-4 h-4" /> Cards
                </TabsTrigger>
                <TabsTrigger value="list" className="rounded-full px-3 flex items-center gap-1 text-sm">
                  <ListIcon className="w-4 h-4" /> List
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button size="sm" className="rounded-full px-4">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
            <div className="flex-1 flex items-center gap-2">
              <Input
                placeholder="Search publications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs rounded-full bg-gray-50 border border-gray-200"
              />
              <Search className="text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2">
              {/* FILTER BUTTON WITH BADGE */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full px-4 flex items-center gap-2">
                    <span>Filters</span>
                    {(categoryFilter.length + topicFilter.length + yearFilter.length + authorFilter.length) > 0 && (
                      <span className="ml-1 bg-primary text-white rounded-full px-2 py-0.5 text-xs">
                        {(categoryFilter.length + topicFilter.length + yearFilter.length + authorFilter.length)}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-5 rounded-2xl shadow-xl">
                  <div className="flex flex-col gap-4">
                    {/* Category Filter */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-700 mb-1">Category</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between rounded-full">
                            {categoryFilter.length === 0
                              ? "Select category"
                              : `${categoryFilter.length} selected`}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
                          {categories.map((c) => (
                            <DropdownMenuCheckboxItem
                              key={c}
                              checked={categoryFilter.includes(c)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setCategoryFilter([...categoryFilter, c]);
                                } else {
                                  setCategoryFilter(categoryFilter.filter((item) => item !== c));
                                }
                              }}
                            >
                              {c}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {/* Topic Filter */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-700 mb-1">Topic</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between rounded-full">
                            {topicFilter.length === 0
                              ? "Select topic"
                              : `${topicFilter.length} selected`}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
                          {topics.map((t) => (
                            <DropdownMenuCheckboxItem
                              key={t}
                              checked={topicFilter.includes(t)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTopicFilter([...topicFilter, t]);
                                } else {
                                  setTopicFilter(topicFilter.filter((item) => item !== t));
                                }
                              }}
                            >
                              {t}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {/* Year Filter */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-700 mb-1">Year</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between rounded-full">
                            {yearFilter.length === 0
                              ? "Select year"
                              : `${yearFilter.length} selected`}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
                          {years.map((y) => (
                            <DropdownMenuCheckboxItem
                              key={y}
                              checked={yearFilter.includes(y)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setYearFilter([...yearFilter, y]);
                                } else {
                                  setYearFilter(yearFilter.filter((item) => item !== y));
                                }
                              }}
                            >
                              {y}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {/* Author Filter */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-700 mb-1">Author</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between rounded-full">
                            {authorFilter.length === 0
                              ? "Select author"
                              : `${authorFilter.length} selected`}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
                          {authors.map((a) => (
                            <DropdownMenuCheckboxItem
                              key={a}
                              checked={authorFilter.includes(a)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAuthorFilter([...authorFilter, a]);
                                } else {
                                  setAuthorFilter(authorFilter.filter((item) => item !== a));
                                }
                              }}
                            >
                              {a}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full mt-2 rounded-full text-primary border border-primary hover:bg-primary/10"
                      onClick={() => {
                        setCategoryFilter([]);
                        setTopicFilter([]);
                        setYearFilter([]);
                        setAuthorFilter([]);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  disabled={!data?.previous}
                  onClick={() => data?.previous && setPageUrl(data.previous)}
                  aria-label="Previous Page"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  disabled={!data?.next}
                  onClick={() => data?.next && setPageUrl(data.next)}
                  aria-label="Next Page"
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </div>
          {/* Bulk Actions (only in List view) */}
          {viewMode === 'list' && (
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="accent-blue-500 rounded"
                aria-label="Select all"
              />
              <span className="text-xs">Select All</span>
              <Button size="sm" variant="destructive" disabled={selected.length === 0} onClick={handleBulkDelete} className="text-xs rounded-full">
                Delete Selected
              </Button>
              {bulkActionMsg && <span className="text-xs text-green-600 ml-2">{bulkActionMsg}</span>}
            </div>
          )}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading publications...</div>
          ) : (
            <Tabs value={viewMode}>
              <TabsContent value="card">
                <CardView filtered={filtered} selected={[]} toggleSelect={() => {}} loading={loading} />
              </TabsContent>
              <TabsContent value="list">
                <PublicationList
                  publications={filtered.map((pub) => ({
                    id: String(pub.id),
                    title: pub.title,
                    authors: pub.authors.map((a) => a.name),
                    publishDate: pub.date_publish,
                    status: "Published", // Adjust if you have status
                    abstract: pub.description,
                  }))}
                  stats={filtered.map((pub) => ({
                    id: String(pub.id),
                    views: pub.viewed,
                    downloads: pub.download_count,
                    viewsChange: "",
                    downloadsChange: "",
                  }))}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );

} 