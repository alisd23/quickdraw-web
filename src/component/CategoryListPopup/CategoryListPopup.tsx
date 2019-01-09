import * as React from 'react';
import { FunctionComponent, useReducer, Reducer, Fragment } from 'react';
import { Popup, Button, Loader } from 'semantic-ui-react';
import * as Case from 'case';
import axios from 'axios';

import './CategoryListPopup.scss';

interface ICategoryListState {
  isLoading: boolean;
  error: string | null;
  categories: string[] | null;
}

interface IReducerAction<TType, TPayload> {
  type: TType;
  payload: TPayload;
}

const categoryListInitialState: ICategoryListState = {
  isLoading: true,
  error: null,
  categories: null,
};

type ICategoryListAction = (
  IReducerAction<'LOAD_ATTEMPT', null> |
  IReducerAction<'LOAD_SUCCESS', string[]> |
  IReducerAction<'LOAD_ERROR', string>
);

const categoryListReducer: Reducer<ICategoryListState, ICategoryListAction> = (state, action) => {
  switch (action.type) {
    case 'LOAD_ATTEMPT':
      return {
        isLoading: true,
        error: null,
        categories: null,
      };
    case 'LOAD_SUCCESS':
      return {
        isLoading: false,
        error: null,
        categories: action.payload,
      };
    case 'LOAD_ERROR':
      return {
        isLoading: false,
        error: action.payload,
        categories: null,
      };
    default:
      return state;
  }
}

export const CategoryListPopup: FunctionComponent = () => {
  const [state, dispatch] = useReducer(categoryListReducer, categoryListInitialState);

  async function fetchCategories() {
    dispatch({ type: 'LOAD_ATTEMPT', payload: null });
    try {
      const result = await axios.get<string>('/classes.txt');
      const categories = result.data.split('\n');
      dispatch({ type: 'LOAD_SUCCESS', payload: categories });
    } catch {
      dispatch({ type: 'LOAD_ERROR', payload: 'Failed to load categories' });
    }
  }

  React.useEffect(() => { fetchCategories(); }, []);

  return (
    <Popup
      trigger={<Button basic>Categories</Button>}
      content={<CategoryPopupContent {...state} />}
      position='top right'
      on='click'
    />
  );
}

type ICategoryListProps = ICategoryListState;

const CategoryPopupContent: FunctionComponent<ICategoryListProps> = (props) => {
  if (props.isLoading) {
    return <Loader inverted />;
  }

  if (props.error || !props.categories || props.categories.length === 0) {
    return <span>Could not load the categories</span>;
  }

  return (
    <div className="category-list-popup">
      {
        props.categories.map(category => (
          <p key={category}>{Case.title(category)}</p>
        ))
      }
    </div>
  )
}
