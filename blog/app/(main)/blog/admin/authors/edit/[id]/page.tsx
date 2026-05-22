import AuthorForm from '../../AuthorForm';
import { getAuthorById } from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function EditAuthorPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const author = await getAuthorById(params.id);
  if (!author) return notFound();

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <AuthorForm author={author} />
    </div>
  );
}
