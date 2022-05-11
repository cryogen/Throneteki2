import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Form, Col, Button, Row } from 'react-bootstrap';
import { useTranslation, Trans } from 'react-i18next';
import { Formik, FormikProps } from 'formik';
import * as yup from 'yup';

export interface RegisterDetails {
    username: string;
    email: string;
    password: string;
    passwordAgain: string;
}

interface RegisterProps {
    onSubmit: (values: RegisterDetails) => void;
}

const initialValues = {
    username: '',
    email: '',
    password: '',
    passwordAgain: ''
};

export const Register = (props: RegisterProps) => {
    const { t } = useTranslation('register');

    const schema = yup.object({
        username: yup
            .string()
            .required(t('You must specify a username'))
            .min(3, t('Username must be at least 3 characters and no more than 15 characters long'))
            .max(
                15,
                t('Username must be at least 3 characters and no more than 15 characters long')
            )
            .matches(
                /^[A-Za-z0-9_-]+$/,
                t('Usernames must only use the characters a-z, 0-9, _ and -')
            ),
        email: yup
            .string()
            .email(t('Please enter a valid email address'))
            .required(t('You must specify an email address')),
        password: yup
            .string()
            .min(6, t('Password must be at least 6 characters'))
            .required(t('You must specify a password')),
        passwordAgain: yup
            .string()
            .required(t('You must confirm your password'))
            .oneOf([yup.ref('password'), null], t('The passwords you have entered do not match'))
    });

    return (
        <>
            <p>
                <Trans i18nKey='register:privacy'>
                    We require information from you in order to service your access to the site.
                    Please see the <Link to='/privacy'>privacy policy</Link> for details on why we
                    need this information and what we do with it.
                </Trans>
            </p>
            <Formik
                validationSchema={schema}
                onSubmit={props.onSubmit}
                initialValues={initialValues}
            >
                {(formProps: FormikProps<RegisterDetails>): ReactElement => (
                    <Form
                        onSubmit={(event: React.FormEvent<HTMLFormElement>): void => {
                            event.preventDefault();
                            formProps.handleSubmit(event);
                        }}
                    >
                        <Row>
                            <Form.Group
                                as={Col}
                                md='6'
                                className='mt-2'
                                controlId='formGridUsername'
                            >
                                <Form.Label>{t('Username')}</Form.Label>
                                <Form.Control
                                    type='text'
                                    placeholder={t('Enter a username')}
                                    isInvalid={
                                        formProps.touched.username && !!formProps.errors.username
                                    }
                                    {...formProps.getFieldProps('username')}
                                />
                                <Form.Control.Feedback type='invalid'>
                                    {formProps.errors.username}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Col} md='6' className='mt-2' controlId='formGridEmail'>
                                <Form.Label>{t('Email')}</Form.Label>
                                <Form.Control
                                    type='email'
                                    placeholder={t('Enter an email address')}
                                    isInvalid={formProps.touched.email && !!formProps.errors.email}
                                    {...formProps.getFieldProps('email')}
                                />
                                <Form.Control.Feedback type='invalid'>
                                    {formProps.errors.email}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group
                                as={Col}
                                md='6'
                                className='mt-2'
                                controlId='formGridPassword'
                            >
                                <Form.Label>{t('Password')}</Form.Label>
                                <Form.Control
                                    type='password'
                                    placeholder={t('Enter a password')}
                                    isInvalid={
                                        formProps.touched.password && !!formProps.errors.password
                                    }
                                    {...formProps.getFieldProps('password')}
                                />
                                <Form.Control.Feedback type='invalid'>
                                    {formProps.errors.password}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group
                                as={Col}
                                md='6'
                                className='mt-2'
                                controlId='formGridPassword1'
                            >
                                <Form.Label>{t('Password (again)')}</Form.Label>
                                <Form.Control
                                    type='password'
                                    placeholder={t('Enter the same password')}
                                    isInvalid={
                                        formProps.touched.passwordAgain &&
                                        !!formProps.errors.passwordAgain
                                    }
                                    {...formProps.getFieldProps('passwordAgain')}
                                />
                                <Form.Control.Feedback type='invalid'>
                                    {formProps.errors.passwordAgain}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Row>

                        <div className='text-center mt-3'>
                            <Button variant='primary' type='submit'>
                                {t('Register')}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </>
    );
};
