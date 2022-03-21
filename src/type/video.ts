interface Video {
	publishedAt: string;
	title: string;
    channelTitle: string;
    tags: string[];
    categoryId: number;
    ranking: number;
    videoId: string;
    platform: number;
}

interface RawVideo {
    videoId: string;
	title: string;
    channelTitle: string;
	publishedAt: string;
    tag: string;
    categoryId: number;
    platform: number;
}