import "./publicationSection.scss";

const PublicationSection = ({ publication }) => {
  const { content } = publication;

  return (
    <div className="publication-section">
      <div className="publication-content">
        <div
          className="content-text"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

export default PublicationSection;
