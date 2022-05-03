import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Col, Form, Button, Row } from 'react-bootstrap';
import { Formik, FormikProps } from 'formik';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { useQuery } from '../../app/hooks';

export interface LoginDetails {
    username: string;
    password: string;
    returnUrl: string;
}

interface LoginProps {
    onSubmit(details: LoginDetails): void;
}

export const Login = (props: LoginProps) => {
    const { t } = useTranslation();
    const query = useQuery();

    const schema = yup.object({
        username: yup.string().required(t('You must specify a username')),
        password: yup.string().required(t('You must specify a password'))
    });

    const initialValues: LoginDetails = {
        username: '',
        password: '',
        returnUrl: query.get('ReturnUrl') || ''
    };

    return (
        <Formik validationSchema={schema} onSubmit={props.onSubmit} initialValues={initialValues}>
            {(formProps: FormikProps<LoginDetails>) => (
                <Form
                    onSubmit={(event) => {
                        event.preventDefault();
                        formProps.handleSubmit(event);
                    }}
                >
                    <Row>
                        <Form.Group as={Col} lg='6' controlId='formGridUsername'>
                            <Form.Label>{t('Username')}</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder={t('Enter your username')}
                                {...formProps.getFieldProps('username')}
                            />
                            <Form.Control.Feedback type='invalid'>
                                {formProps.errors.username}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group as={Col} controlId='formGridPassword'>
                            <Form.Label>{t('Password')}</Form.Label>
                            <Form.Control
                                name='password'
                                type='password'
                                placeholder={t('Enter your password')}
                                value={formProps.values.password}
                                onChange={formProps.handleChange}
                                onBlur={formProps.handleBlur}
                                isInvalid={
                                    formProps.touched.password && !!formProps.errors.password
                                }
                            />
                            <Form.Control.Feedback type='invalid'>
                                {formProps.errors.password}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Row>
                    <Link to='/account/forgot'>
                        <Trans>Forgotten your password?</Trans>
                    </Link>

                    <div className='text-center'>
                        <Button variant='primary' type='submit'>
                            {t('Login')}
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};
