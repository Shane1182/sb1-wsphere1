import React from 'react';
import { Users, BookOpen, CheckCircle, Clock } from 'lucide-react';

export function Analytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Platform Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-blue-900">24</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <p className="mt-2 text-sm text-blue-600">+3 this month</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Active Modules</p>
              <p className="text-2xl font-bold text-green-900">12</p>
            </div>
            <BookOpen className="h-8 w-8 text-green-500" />
          </div>
          <p className="mt-2 text-sm text-green-600">2 new this week</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Completion Rate</p>
              <p className="text-2xl font-bold text-purple-900">78%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-500" />
          </div>
          <p className="mt-2 text-sm text-purple-600">+5% from last month</p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Avg. Time</p>
              <p className="text-2xl font-bold text-orange-900">45m</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
          <p className="mt-2 text-sm text-orange-600">Per module completion</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Modules</h3>
          <div className="space-y-4">
            {[
              { name: 'Company Introduction', completion: 95 },
              { name: 'Health & Safety', completion: 88 },
              { name: 'Data Protection', completion: 76 },
            ].map((module) => (
              <div key={module.name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{module.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${module.completion}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">{module.completion}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { user: 'John Smith', action: 'Completed Health & Safety', time: '2h ago' },
              { user: 'Sarah Wilson', action: 'Started Company Introduction', time: '4h ago' },
              { user: 'Mike Johnson', action: 'Completed Data Protection', time: '6h ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}