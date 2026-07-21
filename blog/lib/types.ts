export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaDescription: string;
  coverImage: string;
  videoUrl?: string;
  author: string;
  authorBio: string;
  authorImage: string;
  authorJobTitle: string; 
  authorExperienceYears?: number; 
  authorAwards?: string[]; 
  authorAlumniOf?: { name: string; sameAs: string }[]; 
  authorSocials: {
    twitter?: string;
    linkedin?: string;
    website?: string; 
  };
  date: string;
  lastModified?: string;
  category: string;
  tags: string[];
  published: boolean;
  readingTime?: number;
  seoScore?: number;
  isSponsored?: boolean;
  isAiAssisted?: boolean;
  factCheckedBy?: string;
  factCheckerRole?: string; 
  authorKnowsAbout?: { name: string; sameAs: string }[]; 
  keyTakeaways?: string[];
  sources?: { title: string; url: string; type: 'primary' | 'secondary' }[]; 
  researchMethodology?: string; 
  reviewCycleDays?: number;
  nextReviewDate?: string;
  faqs?: { question: string; answer: string }[]; 
  searchIntent?: 'informational' | 'transactional' | 'commercial' | 'navigational'; 
  isPillarPage?: boolean;
  semanticMentions?: { name: string; sameAs: string }[]; 
  integrityHash?: string; 
  isNoIndex?: boolean; 
}

export interface StorySlide {
  id: string;
  image: string;
  video?: string;
  text?: string;
}

export interface WebStory {
  id: string;
  title: string;               
  slug: string;
  description: string;         
  category: string;            
  tags: string[];              
  posterImage: string;         
  squarePoster?: string;       
  landscapePoster?: string;    
  videoUrl?: string;
  date: string;                
  lastModified?: string;       
  author: string;
  authorBio?: string;          
  authorImage?: string;        
  authorSocials?: {            
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  publisherLogo: string;       
  slides: StorySlide[];
  published: boolean;
  seoTitle?: string;           
  metaDescription?: string;    
  isSponsored?: boolean;       
  textLength?: number;         
  isNoIndex?: boolean; 
}

export interface AuthorProfile {
  id: string;
  name: string;
  bio: string;
  image: string;
  jobTitle: string;
  experienceYears?: number;
  awards?: string[];
  alumniOf?: { name: string; sameAs: string }[];
  socials: {
    twitter?: string;
    linkedin?: string;
    website?: string;
    youtube?: string;
    facebook?: string;
    instagram?: string;
  };
  knowsAbout?: { name: string; sameAs: string }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}
