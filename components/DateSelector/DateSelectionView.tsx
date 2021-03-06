import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Divider, Row } from 'antd';
import DatePicker from './DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import getRandomDate from './getRandomDate';
import useWindowDimensions from '../../utils/useWindowDimensions';
import { sendBtnClickToGA } from '../../utils/googleAnalytics';
import styles from '../../styles/Home.module.css';

interface DateSelectionProps {
  showingDate: number;
  handleSubmit: (epoch: number) => void;
}

const DateSelectionView: React.FC<DateSelectionProps> = (props) => {
  const { showingDate, handleSubmit } = props;
  const { width, isDesktop, isMobile } = useWindowDimensions();
  const [date, setDate] = useState<Dayjs | null>(dayjs(showingDate * 1000));
  // this variable makes sure they don't spam the 'Go' or 'Random' btns
  const [justFinished, setJustFinished] = useState(false);

  const submitDate = (date: Dayjs | null) => {
    if (date && !justFinished) {
      // Update the parent date which calls the api
      handleSubmit(date.startOf('day').unix());
      setTimeout(() => {
        setJustFinished(false);
      }, 2000);
      setJustFinished(true);
    }
  };

  useEffect(() => {
    if (showingDate) {
      setDate(dayjs(showingDate * 1000));
    }
  }, [showingDate]);

  const handleRandom = () => {
    if (!justFinished) {
      const newDate = getRandomDate();
      setDate(newDate);
      submitDate(newDate);
      sendBtnClickToGA('random', newDate?.format('YYYY-MM-DD') || '');
    }
  };

  const handleGo = () => {
    sendBtnClickToGA('go', date?.format('YYYY-MM-DD') || '');
    submitDate(date);
  };

  const buttonSize = isDesktop ? 'large' : isMobile ? 'small' : 'middle';
  const orDividerWidth = width < 500 ? '90%' : width > 800 ? '50%' : '70%';

  return (
    <Row justify='center'>
      <Col lg={24} md={18}>
        <Card bordered={false} headStyle={{ borderBottom: 0 }} style={{ width: '100%' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 24 }}>The Internet on a Day</h2>
            <p style={{ marginBottom: '1rem', color: 'rgb(210, 210, 210)', fontSize: isDesktop ? 15 : 13 }}>
              Choose a date or click <strong>Random</strong> to see the most upvoted news, pictures and memes on a day
              in Reddit history between 2010 and today.
            </p>
          </div>
          <Row gutter={16} justify='center' align='middle' style={{ margin: '20px -20px 0', padding: '8px 0' }}>
            <Col>
              <h4 style={{ margin: 0 }}>Select a date:</h4>
            </Col>
            <Col>
              <DatePicker
                value={date}
                format='MM-DD-YYYY'
                onChange={(value) => setDate(value)}
                size={buttonSize}
                style={{ width: isMobile ? 124 : 'inherit' }}
                aria-label='date selector'
                disabledDate={(date) => !date || date.isBefore('2010-01-01') || date.isAfter(new Date())}
                className={styles.datepicker_calendar_wrapper}
              />
            </Col>
            <Col>
              <Button
                type='primary'
                htmlType='submit'
                aria-label='Show results for this date'
                size={buttonSize}
                style={{ paddingLeft: isMobile ? 10 : 16, paddingRight: isMobile ? 10 : 16 }}
                disabled={
                  date === null ||
                  justFinished ||
                  date.unix() === showingDate ||
                  date.isBefore('2010-01-01') ||
                  date.isAfter(new Date())
                }
                onClick={handleGo}
              >
                Go
              </Button>
            </Col>
          </Row>

          <Row justify='center' align='middle'>
            <Divider
              style={{
                width: orDividerWidth,
                minWidth: orDividerWidth,
                paddingBottom: 8,
              }}
            >
              or
            </Divider>
          </Row>
          <Row justify='center'>
            <Button
              onClick={handleRandom}
              size='large'
              aria-label='View posts from a random date'
              disabled={justFinished}
              style={{ backgroundColor: 'black', padding: '0 20px' }}
            >
              Random
            </Button>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default DateSelectionView;
