import React, { PropTypes, Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Button, Row, Col, Popconfirm, Table } from 'antd';

import { getActiveSpace, getActiveContentType } from '../../../selectors';

import * as Actions from './actions';
import FieldCreateForm from '../../../components/FieldCreateForm';

class ContentTypeSingle extends Component {

  static propTypes = {
    space: PropTypes.object,
    contentType: PropTypes.object,
  }

  state = {
    modalVisible: false,
  }

  handleClickAddField = () => {
    this.setState({
      modalVisible: true,
    });
  }

  handleEditField = (fieldId) => {
    const { contentType } = this.props;
    const field = _.find(_.get(contentType, 'fields'), field => field._id === fieldId);

    this.setState({
      fieldValues: field,
      modalVisible: true,
    })
  }

  handleSubmitFieldCreate = () => {

    const form = this.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }

      console.log('values To Submit', values);
      const { space, contentType } = this.props;
      const { addField, updateField } = this.props.actions;

      const fieldOperation = _.isEmpty(values._id) ? addField : updateField;
      fieldOperation(space._id, contentType._id, contentType, values)
      .then(response => {
        console.log('action response', response);
        form.resetFields();
        this.setState({ modalVisible: false });
      });

    });
  }

  handleDeleteField = (fieldId) => {

    const { space, contentType } = this.props;
    const { deleteField } = this.props.actions;

    deleteField(space._id, contentType._id, contentType, fieldId)
    .then(response => {
      console.log('action response', response);
    });
  }

  handleCancel = () => {
    this.setState({
      modalVisible: false,
    });
  }


  handleSelectDelete = () => {
    const { space } = this.props;
    const { deleteContentType } = this.props.actions;
    const contentTypeId = this.props.params.contentTypeId;
    deleteContentType(space._id, contentTypeId);
  }

  createFormRef = (form) => {
    this.form = form;
  }

  render() {
    const { space } = this.props;
    const { contentType } = this.props;
    if (!space || !contentType) return (<div />);

    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => <h4>{text}</h4>
      },
      {
        title: 'Type',
        dataIndex: 'fieldType',
        key: 'fieldType',
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <span>
            <a href="#" onClick={e => this.handleEditField(record._id)}>
              Edit
            </a>
            <span className="ant-divider" />
            <Popconfirm
              title="Are you sure delete this field?"
              onConfirm={e => this.handleDeleteField(record._id)}
              onCancel={this.cancel}
              okText="Yes"
              cancelText="No"
            >
              <a href="#">Delete</a>
            </Popconfirm>
          </span>
        ),
      }
    ];

    const data = _.map(_.get(contentType, 'fields'), (field, i) => ({
      _id: field._id,
      key: i,
      name: field.name,
      fieldType: field.fieldType,
    }));

    return (
      <div>
        <Row>
          <Col>
            <h2>{contentType.name}</h2>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button type="primary" onClick={this.handleClickAddField}>Add Field</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table
              showHeader={false}
              columns={columns}
              dataSource={data}
              locale={{
                emptyText: 'No fields yet, click add field to start'
              }}
            />
          </Col>
        </Row>

        <FieldCreateForm
          ref={this.createFormRef}
          fieldValues={this.state.fieldValues}
          visible={this.state.modalVisible}
          onCancel={this.handleCancel}
          onCreate={this.handleSubmitFieldCreate}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    space: getActiveSpace(state, ownProps),
    contentType: getActiveContentType(state, ownProps),
  }
}

const actions = {
  deleteContentType: Actions.deleteContentType,
  addField: Actions.addField,
  updateField: Actions.updateField,
  deleteField: Actions.deleteField,
}

const mapDispatchToProps = (dispatch) => {
  return { actions: bindActionCreators(actions, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentTypeSingle);
