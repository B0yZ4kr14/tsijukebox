import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GitHubRepoInfo {
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  size: number;
  language: string;
  html_url: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
  html_url: string;
}

export interface GitHubContributor {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  prerelease: boolean;
  draft: boolean;
}

export interface GitHubBranch {
  name: string;
  protected: boolean;
}

export interface GitHubLanguages {
  [key: string]: number;
}

interface UseGitHubStatsReturn {
  repoInfo: GitHubRepoInfo | null;
  commits: GitHubCommit[];
  contributors: GitHubContributor[];
  releases: GitHubRelease[];
  branches: GitHubBranch[];
  languages: GitHubLanguages;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

async function fetchGitHubData<T>(action: string, path: string = ''): Promise<T | null> {
  try {
    const { data, error } = await supabase.functions.invoke('github-repo', {
      body: { action, path }
    });

    if (error) {
      console.error(`[useGitHubStats] Error fetching ${action}:`, error);
      return null;
    }

    if (!data?.success) {
      console.error(`[useGitHubStats] Failed ${action}:`, data?.error);
      return null;
    }

    return data.data as T;
  } catch (err) {
    console.error(`[useGitHubStats] Exception in ${action}:`, err);
    return null;
  }
}

export function useGitHubStats(): UseGitHubStatsReturn {
  const [repoInfo, setRepoInfo] = useState<GitHubRepoInfo | null>(null);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [contributors, setContributors] = useState<GitHubContributor[]>([]);
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [languages, setLanguages] = useState<GitHubLanguages>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        repoData,
        commitsData,
        contributorsData,
        releasesData,
        branchesData,
        languagesData
      ] = await Promise.all([
        fetchGitHubData<GitHubRepoInfo>('repo-info'),
        fetchGitHubData<GitHubCommit[]>('commits'),
        fetchGitHubData<GitHubContributor[]>('contributors'),
        fetchGitHubData<GitHubRelease[]>('releases'),
        fetchGitHubData<GitHubBranch[]>('branches'),
        fetchGitHubData<GitHubLanguages>('languages')
      ]);

      if (repoData) setRepoInfo(repoData);
      if (commitsData) setCommits(commitsData);
      if (contributorsData) setContributors(contributorsData);
      if (releasesData) setReleases(releasesData);
      if (branchesData) setBranches(branchesData);
      if (languagesData) setLanguages(languagesData);

      if (!repoData && !commitsData && !contributorsData) {
        setError('Falha ao carregar dados do GitHub');
      }
    } catch (err) {
      console.error('[useGitHubStats] Error:', err);
      setError('Erro ao conectar com o GitHub');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    repoInfo,
    commits,
    contributors,
    releases,
    branches,
    languages,
    isLoading,
    error,
    refetch: fetchAllData
  };
}
