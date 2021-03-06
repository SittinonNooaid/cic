import _ from 'lodash';
import { fetchCreateContentType, fetchUpdateContentType, fetchDeleteContentType } from '../../../api/cic/contentTypes';
import { getSpace } from '../../../actions/spaces';
import { openNotification } from '../../../actions/notification';

export const createContentType = (spaceId, values) => {
  return (dispatch) => {
    return fetchCreateContentType(spaceId, values)
    .then((createResponse) => {
      const contentTypeName = _.get(createResponse, 'item.name', 'ContentType');
      dispatch(getSpace(spaceId));
      openNotification('success', { message: `${contentTypeName} Created` });
    });
  };
};

export const deleteContentType = (spaceId, contentTypeId) => {
  return (dispatch) => {
    return fetchDeleteContentType(spaceId, contentTypeId)
    .then(() => {
      dispatch(getSpace(spaceId));
      openNotification('success', { message: 'ContentType Deleted' });
    });
  };
};

export const addField = (spaceId, contentTypeId, contentType, values) => {
  return (dispatch) => {
    const _contentTypeToUpdate = _.assign({}, contentType, {
      displayField: (values.isDisplayField === true) ? values.identifier : contentType.displayField,
      fields: [...contentType.fields, values],
    });

    return fetchUpdateContentType(spaceId, contentTypeId, _contentTypeToUpdate)
    .then(() => {
      dispatch(getSpace(spaceId));
      openNotification('success', { message: `Field ${values.name} Created` });
    });
  };
};

export const updateField = (spaceId, contentTypeId, contentType, values) => {
  return (dispatch) => {
    const fieldId = values._id;
    const _contentTypeToUpdate = _.assign({}, contentType, {
      displayField: (values.isDisplayField === true) ? values.identifier : contentType.displayField,
      fields: _.map(contentType.fields, (field) => {
        if (field._id === fieldId) {
          return { ...field, ...values };
        }
        return field;
      }),
    });

    return fetchUpdateContentType(spaceId, contentTypeId, _contentTypeToUpdate)
    .then(() => {
      dispatch(getSpace(spaceId));
      openNotification('success', { message: 'Field Updated' });
    });
  };
};

export const deleteField = (spaceId, contentTypeId, contentType, fieldId) => {
  return (dispatch) => {
    const _contentTypeToUpdate = _.assign({}, contentType, {
      fields: _.filter(contentType.fields, field => field._id !== fieldId),
    });

    return fetchUpdateContentType(spaceId, contentTypeId, _contentTypeToUpdate)
    .then(() => {
      dispatch(getSpace(spaceId));
      openNotification('success', { message: 'Field Deleted' });
    });
  };
};
