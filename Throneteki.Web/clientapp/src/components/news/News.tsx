import { Trans } from 'react-i18next';

import { News } from '../../types/lobby';
import Alert from '../site/Alert';

interface NewsProps {
    news: News[];
}

const News = ({ news }: NewsProps) => {
    const icons = ['unforged-red', 'unforged-blue', 'unforged-yellow'];

    let iconIndex = 0;
    let newsIndex = 0;
    const renderedNews = news.map((newsItem) => {
        return <NewsItem key={newsIndex++} icon={icons[iconIndex++ % 3]} newsItem={newsItem} />;
    });

    if (renderedNews.length === 0) {
        renderedNews.push(
            <Alert variant='info'>
                <Trans key='nonews'>There is no site news at the moment</Trans>
            </Alert>
        );
    }

    return <div className='overflow-y-auto'>{renderedNews}</div>;
};

export default News;
