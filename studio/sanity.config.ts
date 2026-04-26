import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemas } from './schemas';

export default defineConfig({
  name: 'mirkoschubert-retro',
  title: 'mirkoschubert.de',

  projectId: '6bds6nbf',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem().title('Projects').schemaType('project').child(S.documentTypeList('project')),
            S.listItem().title('Writings').schemaType('writing').child(S.documentTypeList('writing')),
            S.divider(),
            S.listItem().title('Publications').schemaType('publication').child(S.documentTypeList('publication')),
            S.listItem().title('Press Links').schemaType('pressLink').child(S.documentTypeList('pressLink')),
            S.divider(),
            S.listItem().title('Albums').schemaType('album').child(S.documentTypeList('album')),
            S.divider(),
            S.listItem().title('Photos').schemaType('photo').child(S.documentTypeList('photo')),
            S.listItem().title('Photo Series').schemaType('photoSeries').child(S.documentTypeList('photoSeries')),
            S.divider(),
            S.listItem()
              .title('System Info')
              .schemaType('sysInfo')
              .child(S.document().schemaType('sysInfo').documentId('sysinfo-main'))
          ])
    }),
    visionTool()
  ],

  schema: {
    types: schemas
  }
});
