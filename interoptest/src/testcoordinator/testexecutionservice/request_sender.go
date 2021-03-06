// Copyright 2018, OpenCensus Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package testexecutionservice

import (
	"context"
	"errors"
	"github.com/census-ecosystem/opencensus-experiments/interoptest/src/testcoordinator/genproto"
	"sync"

	"google.golang.org/grpc"
)

// Sender is the type that stores necessary information for making test requests, and sends
// test execution request to each test server.
type Sender struct {
	mu        sync.RWMutex
	startOnce sync.Once

	canDialInsecure bool

	reqID      int64
	reqName    string
	serverAddr string
	hops       []*interop.ServiceHop
}

var (
	errAlreadyStarted = errors.New("already started")
	errSizeNotMatch   = errors.New("sizes do not match")
)

// NewUnstartedSender just creates a new Sender.
// TODO: consider using options.
func NewUnstartedSender(
	canDialInsecure bool,
	reqID int64,
	reqName string,
	serverAddr string,
	hops []*interop.ServiceHop) (*Sender, error) {
	s := &Sender{
		canDialInsecure: canDialInsecure,
		reqID:           reqID,
		reqName:         reqName,
		serverAddr:      serverAddr,
		hops:            hops,
	}
	return s, nil
}

// Start transforms the request id, request name and Services into a TestRequest.
// Then sends a TestRequest to the corresponding server, and returns the response
// and error.
func (s *Sender) Start() (*interop.TestResponse, error) {
	var resp *interop.TestResponse
	err := errAlreadyStarted
	s.startOnce.Do(func() {
		s.mu.Lock()
		defer s.mu.Unlock()

		addr := s.serverAddr
		if cc, err := s.dialToServer(addr); err == nil {
			resp, err = s.send(cc)
		}
	})
	return resp, err
}

// TODO: send HTTP TestRequest
func (s *Sender) send(cc *grpc.ClientConn) (*interop.TestResponse, error) {
	defer cc.Close()
	req := &interop.TestRequest{
		Id:          s.reqID,
		Name:        s.reqName,
		ServiceHops: s.hops,
	}

	testSvcClient := interop.NewTestExecutionServiceClient(cc)
	return testSvcClient.Test(context.Background(), req)
}

func (s *Sender) dialToServer(addr string) (*grpc.ClientConn, error) {
	var dialOpts []grpc.DialOption
	if s.canDialInsecure {
		dialOpts = append(dialOpts, grpc.WithInsecure())
	}
	return grpc.Dial(addr, dialOpts...)
}
