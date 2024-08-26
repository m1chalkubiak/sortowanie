import { Category, getCategories } from './mockedApi';

export interface CategoryListElement {
  name: string;
  id: number;
  image: string;
  order: number;
  children: CategoryListElement[];
  showOnHome: boolean;
}

const getOrder = (title: string, id: number): number => {
  const order = title.includes('#') ? title.split('#')[0] : title;
  const parsedOrder = parseInt(order);

  return isNaN(parsedOrder) ? id : parsedOrder;
};

const getSubCategories = (categories: Category[]): CategoryListElement[] => {
  return categories.map((child) => {
    const order = getOrder(child.Title, child.id);
    const subCategories = child.children
      ? getSubCategories(child.children)
      : [];

    subCategories.sort((a, b) => a.order - b.order);

    return {
      order,
      id: child.id,
      image: child.MetaTagDescription,
      name: child.name,
      children: subCategories,
      showOnHome: false,
    };
  });
};

export const categoryTree = async (): Promise<CategoryListElement[]> => {
  const res = await getCategories();

  if (!res.data) {
    return [];
  }

  const toShowOnHome: number[] = [];

  const result = res.data.map((category) => {
    const order = getOrder(category.Title, category.id);

    if (category.Title && category.Title.includes('#')) {
      toShowOnHome.push(category.id);
    }

    const subCategories = category.children
      ? getSubCategories(category.children)
      : [];

    subCategories.sort((a, b) => a.order - b.order);

    return {
      order,
      id: category.id,
      image: category.MetaTagDescription,
      name: category.name,
      children: subCategories,
      showOnHome: false,
    };
  });

  result.sort((a, b) => a.order - b.order);

  if (result.length <= 5) {
    result.forEach((a) => (a.showOnHome = true));
  } else if (toShowOnHome.length > 0) {
    result.forEach((x) => (x.showOnHome = toShowOnHome.includes(x.id)));
  } else {
    result.forEach((x, index) => (x.showOnHome = index < 3));
  }

  return result;
};
