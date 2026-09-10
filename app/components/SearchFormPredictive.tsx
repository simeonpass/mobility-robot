import {
  useFetcher,
  useNavigate,
  type FormProps,
  type Fetcher,
} from 'react-router';
import React, {useRef, useEffect} from 'react';
import type {PredictiveSearchReturn} from '~/lib/search';
import {useAside} from './Aside';

type SearchFormPredictiveChildren = (args: {
  fetchResults: (event: React.ChangeEvent<HTMLInputElement>) => void;
  goToSearch: () => void;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  fetcher: Fetcher<PredictiveSearchReturn>;
}) => React.ReactNode;

type SearchFormPredictiveProps = Omit<FormProps, 'children'> & {
  children: SearchFormPredictiveChildren | null;
};

export const SEARCH_ENDPOINT = '/search';

/**
 *  Search form component that sends search requests to the `/search` route
 **/
export function SearchFormPredictive({
  children,
  className = 'predictive-search-form',
  ...props
}: SearchFormPredictiveProps) {
  const fetcher = useFetcher<PredictiveSearchReturn>({key: 'search'});
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const aside = useAside();
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Reset the input value and blur the input */
  function resetInput(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (inputRef?.current?.value) {
      inputRef.current.blur();
    }
    goToSearch();
  }

  /** Navigate to the search page with the current input value */
  function goToSearch() {
    const term = inputRef.current?.value.trim();
    if (searchTimer.current) clearTimeout(searchTimer.current);
    void navigate(SEARCH_ENDPOINT + (term ? `?${new URLSearchParams({q: term})}` : ''));
    aside.close();
  }

  /** Fetch search results based on the input value */
  function fetchResults(event: React.ChangeEvent<HTMLInputElement>) {
    const q = event.target.value;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      void fetcher.submit(
        {q, limit: 5, predictive: true},
        {method: 'GET', action: SEARCH_ENDPOINT},
      );
    }, q ? 180 : 0);
  }

  // ensure the passed input has a type of search, because SearchResults
  // will select the element based on the input
  useEffect(() => {
    inputRef?.current?.setAttribute('type', 'search');
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  if (typeof children !== 'function') {
    return null;
  }

  return (
    <fetcher.Form {...props} className={className} onSubmit={resetInput}>
      {children({inputRef, fetcher, fetchResults, goToSearch})}
    </fetcher.Form>
  );
}
