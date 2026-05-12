const groq = String.raw;

export const projectsQuery = groq`*[_type == "project"] | order(year desc) {
  _id,
  title,
  slug,
  year,
  type,
  openSource,
  client,
  context,
  role,
  stack,
  summary,
  tags,
  links[] { label, url },
  cover,
  images[] { asset, hotspot }
}`;

export const writingsQuery = groq`*[_type == "writing"] | order(date desc) {
  _id,
  title,
  slug,
  category,
  date,
  tags,
  excerpt,
  body
}`;

export const publicationsQuery = groq`*[_type == "publication"] | order(name asc) {
  _id,
  name,
  slug,
  url,
  logo,
  description,
  period,
  category,
  "links": *[_type == "pressLink" && publication._ref == ^._id] | order(date desc) {
    _id,
    title,
    url,
    date,
    note
  }
}`;

export const albumsQuery = groq`*[_type == "album"] | order(year desc) {
  _id,
  title,
  artist,
  year,
  type,
  slug,
  cover,
  description,
  spotifyUrl,
  appleMusicUrl,
  youtubeMusicUrl,
  tracks[] {
    _key,
    title,
    artist,
    audioFile {
      asset {
        _ref,
        _type
      }
    }
  }
}`;

export const photosQuery = groq`*[_type == "photo"] | order(date desc) {
  _id,
  title,
  image {
    ...,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  },
  date,
  "series": series->{_id, title},
  camera,
  lens,
  iso,
  shutter,
  aperture
}`;

export const photoSeriesQuery = groq`*[_type == "photoSeries"] | order(date desc) {
  _id,
  title,
  slug,
  date,
  description,
  "photoCount": count(*[_type == "photo" && series._ref == ^._id])
}`;

export const sysInfoQuery = groq`*[_type == "sysInfo"][0] {
  user,
  fullname,
  hostname,
  build,
  shell,
  email,
  location,
  available_for,
  bio,
  portrait,
  profession,
  currently,
  tools,
  stack
}`;
